# Repository assessment and next steps

This is a source review snapshot, not a verified runtime or security audit. Suggestions are not approved requirements. Recheck the code and environment before acting.

## Direction agreed so far

- Keep costs free or very low while evaluating whether the app is worth continuing. Favor a simple architecture that is easy to abandon or move.
- Keep SvelteKit as a single application service. The preferred direction is SQLite with Drizzle, replacing Supabase authentication and data access; this is a direction for future work, not a completed migration.
- Start with local development and defer the hosting choice until the app is ready to share. A deployed SQLite database needs persistent storage and backups; DigitalOcean App Platform does not currently support persistent volumes. Consider a persistent host or low-cost Droplet, or revisit managed Postgres such as Neon if that better fits the available hosting and budget. Neon is still a SaaS dependency. Verify current hosting prices and limits before choosing.
- Shared access to all players and games is acceptable for now. A shared password and server-side session are a possible lightweight authentication approach; use HTTPS, secure cookies, and rate limiting when deployed. Individual accounts and private data are not required at this stage.
- A suggested first playable slice is creating a game, adding players, adjusting scores, and finishing or revisiting a game. Automatic scoring and statistics can wait; the precise first-release scope remains to be confirmed.

## What exists

- SvelteKit 2 / Svelte 5 app with Supabase SSR client/session setup (`src/hooks.server.ts`, `src/routes/+layout.ts`). The root route contains authentication UI; `/home` checks for a session. Server hooks, loads, and actions are bundled into the SvelteKit app, not a separate API.
- `/players` reads and inserts into the Supabase `Players` table; `/players/[slug]` reads a player by ID.
- `/newgame` loads players and presents player/color selection. Its Start Game button has no handler, and `src/lib/services/newGameService.ts` is empty. There is no complete scoring or game-history flow apparent in the repository.
- The unit test is an arithmetic example, and the Playwright test expects the starter heading `Welcome to SvelteKit` rather than the current root page (`src/index.test.ts`, `tests/test.ts`).
- No Supabase schema, migrations, or row-level security policies are present in the repository. Actual remote configuration is unknown.

## Suggested priorities

1. **Agree on a first playable scope.** Decide the scoring workflow, supported rules, player model, and persistence expectations below. Define a small end-to-end acceptance scenario before implementation.
2. **Establish a reproducible baseline and plan the transition.** Pin or document a supported Node version, install dependencies, and record results for the checks in the README. Identify any existing Supabase data worth preserving and plan how to replace its authentication and `Players` table with shared access and SQLite. Source imports `svelte-feather-icons` in multiple components, but it is not declared in `package.json`; investigate dependency resolution as part of the baseline.
3. **Address access and data boundaries before storing games.** `/home` checks a session, while the player and new-game server loads/actions shown do not perform an explicit session check. Review server authorization and actual Supabase row-level security while Supabase remains in use; the repository alone cannot establish whether data is exposed. Test the agreed shared-access boundary in the replacement. Avoid logging session data; `src/routes/+layout.svelte` currently logs it when `PUBLIC_ENVIRONMENT` is `Development`.
4. **Make game setup reliable.** Review player/color selection and removal, validation, and error handling. In `src/routes/newgame/+page.svelte`, the Add button passes its click event to a function expecting player and color IDs, and selected colors are not removed from the available list. Specify expected behavior and cover it with tests before wiring game creation.
5. **Implement the agreed scorekeeping slice.** Model and persist a game and score changes, display current scores, and support finishing a game, according to the chosen rules and ownership model. Add tests for the rules and a representative user journey.
6. **Replace starter tests and introduce automated checks.** Update the stale Playwright expectation and add meaningful unit and end-to-end coverage; consider CI once local checks and required test services are reproducible. Review dependencies and deployment configuration separately rather than performing an unscoped upgrade.

## Product decisions to make

- Is this a simple manual score tracker, or should it calculate points for roads, cities, monasteries, fields, and other features? How should corrections and end-of-game scoring work?
- Which edition and expansions are in scope? The setup screen currently offers six colors and caps selection at six; this is an implementation detail, not an agreed ruleset.
- How should the shared password be provisioned, rotated, and recovered? Are temporary guest players needed?
- Should games survive refresh and be resumable across devices? Is offline use important?
- Are game history, statistics, ties, and undo required for the first release or later?

## Validation status

The SvelteKit framework upgrade was verified with Node 24.14.0. `npm install`, `npm run build`, and `npm run test:unit -- --run` pass. The build output includes `entries/hooks.server.js` and route-level `+page.server` entries. `npm run check` still has 14 errors isolated to the pre-existing `/newgame` player/color UI (implicit array types, nullable data, and its click handler signature); these predate the upgrade and are outside this scope. `npm run lint` uses Biome for formatting and lint checks, with Biome's experimental full HTML/Svelte support (`html.experimentalFullSupportEnabled`) enabled so `.svelte` markup is formatted and linted; it passes cleanly. Playwright's existing starter test requires configured Supabase environment values and browser dependencies; its pre-upgrade build failed when those values were absent. Installed dependencies, environment variables, Supabase configuration, and browser availability may affect runtime behavior.
