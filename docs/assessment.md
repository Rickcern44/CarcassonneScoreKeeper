# Repository assessment and next steps

This is a source review snapshot, not a verified runtime or security audit. Suggestions are not approved requirements. Recheck the code and environment before acting.

## Direction agreed so far

- Keep costs free or very low while evaluating whether the app is worth continuing. Favor a simple architecture that is easy to abandon or move.
- Keep SvelteKit as a single application service. Supabase has been removed (issue #14). Persistence is Postgres through Drizzle ORM (issue #15): a Postgres container run by the Aspire AppHost locally, and a single Neon instance planned for production.
- Start with local development and defer the app hosting choice until the app is ready to share. The database is Neon Postgres, which is a SaaS dependency; the Drizzle schema and plain Postgres driver keep it movable to any Postgres. Verify current hosting and Neon prices and limits before choosing. Migrations are to be run in CD, not at app startup.
- An optional Aspire TypeScript AppHost (`aspire-apphost/`, issue #16) runs the SvelteKit app and receives `APP_PASSWORD` as a secret parameter. It also runs a local Postgres container and a `db-migrate` step.
- Shared access to all players and games is acceptable for now. A shared-password login is implemented: `APP_PASSWORD` is a private env var, and sessions are signed cookies keyed on that password, so changing it and restarting rotates the password and signs everyone out. HTTPS and login rate limiting are still needed before deployment. Individual accounts and private data are not required at this stage.
- A suggested first playable slice is creating a game, adding players, adjusting scores, and finishing or revisiting a game. Automatic scoring and statistics can wait; the precise first-release scope remains to be confirmed.

## What exists

- SvelteKit 2 / Svelte 5 app. `src/hooks.server.ts` verifies the session cookie and redirects every route except `/` (the login screen) when there is no valid session. Server hooks, loads, and actions are bundled into the SvelteKit app, not a separate API.
- `/players` lists and creates players (duplicate and empty names are rejected) and `/players/[slug]` shows one, using the Postgres-backed `src/lib/services/playerService.ts` (Drizzle). Unit tests cover the service logic against an in-memory repository and session signing; the Drizzle repository itself is untested.
- `/newgame` loads players and presents player/color selection. Its Start Game button has no handler, and `src/lib/services/newGameService.ts` is empty. There is no complete scoring or game-history flow apparent in the repository.
- Playwright tests check the login screen and the unauthenticated redirect (`tests/test.ts`). `src/index.test.ts` is still an arithmetic placeholder.
- Any player data previously stored in the remote Supabase project is not used by the app and was not migrated or deleted.

## Suggested priorities

1. **Agree on a first playable scope.** Decide the scoring workflow, supported rules, player model, and persistence expectations below. Define a small end-to-end acceptance scenario before implementation.
2. **Establish a reproducible baseline and plan the transition.** Pin or document a supported Node version, install dependencies, and record results for the checks in the README. Decide whether any data left in the old Supabase project is worth importing into Postgres. `svelte-feather-icons` was previously only installed transitively through a Supabase package; it is now declared directly in `package.json`.
3. **Harden access before deployment.** All routes except `/` require a session, enforced in `src/hooks.server.ts`. Add login rate limiting and serve over HTTPS before exposing the app publicly.
4. **Make game setup reliable.** Review player/color selection and removal, validation, and error handling. In `src/routes/newgame/+page.svelte`, the Add button passes its click event to a function expecting player and color IDs, and selected colors are not removed from the available list. Specify expected behavior and cover it with tests before wiring game creation.
5. **Implement the agreed scorekeeping slice.** Model and persist a game and score changes, display current scores, and support finishing a game, according to the chosen rules and ownership model. Add tests for the rules and a representative user journey.
6. **Replace starter tests and introduce automated checks.** Update the stale Playwright expectation and add meaningful unit and end-to-end coverage; consider CI once local checks and required test services are reproducible. Review dependencies and deployment configuration separately rather than performing an unscoped upgrade.

## Product decisions to make

- Is this a simple manual score tracker, or should it calculate points for roads, cities, monasteries, fields, and other features? How should corrections and end-of-game scoring work?
- Which edition and expansions are in scope? The setup screen currently offers six colors and caps selection at six; this is an implementation detail, not an agreed ruleset.
- The shared password comes from the `APP_PASSWORD` env var and is rotated by changing it and restarting. Is rotation without a restart, or any recovery process, needed? Are temporary guest players needed?
- Should games survive refresh and be resumable across devices? Is offline use important?
- Are game history, statistics, ties, and undo required for the first release or later?

## Validation status

The SvelteKit framework upgrade was verified with Node 24.14.0. `npm install`, `npm run build`, and `npm run test:unit -- --run` pass. The build output includes `entries/hooks.server.js` and route-level `+page.server` entries. `npm run check` still has 14 errors isolated to the pre-existing `/newgame` player/color UI (implicit array types, nullable data, and its click handler signature); these predate the upgrade and are outside this scope. `npm run lint` uses Biome for formatting and lint checks, with Biome's experimental full HTML/Svelte support (`html.experimentalFullSupportEnabled`) enabled so `.svelte` markup is formatted and linted; it passes cleanly. After the Supabase removal, `npm run check` reports 13 errors, all in `/newgame`. With Playwright's browsers installed (`npx playwright install`), `npm run playwright-test` passes; its two tests check the login screen and the unauthenticated redirect. Installed dependencies, environment variables, and browser availability may affect runtime behavior.
