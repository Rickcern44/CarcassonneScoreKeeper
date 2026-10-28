# Carcassonne Score Keeper

A mobile-first scorekeeping tool for the board game Carcassonne. It tracks players and scores during a game by manual entry; no Carcassonne scoring rules are built in.

## Current state

- Shared-password login, then a tab bar with **Home**, **Players** and **History**.
- **Players:** add and remove players (removing archives them so past games keep their results) with games and wins per player.
- **New game:** pick 2 to 6 players and a meeple color each, then start. Only one game can be active at a time.
- **Scoreboard:** players ranked by score (cards move to their new rank about 1.5 seconds after the last change, so they do not jump under your finger). Tap a player for quick buttons (-1, +1, +3, +5) or a keypad for any amount, add or subtract. Undo reverses the latest change. Scores are stored in Postgres, so a refresh or another device shows the same game.
- **Finish and results:** finishing asks for confirmation, locks the game, and shows the winner (ties show everyone tied), standings, and a rematch button. Results can be reopened by URL (`/game/<id>`). An active game can also be discarded.
- **Home and History:** the game in progress, recent games, and every finished game.
- **Theme:** light and dark, following the device with a System / Light / Dark override in Settings.

See [repository assessment and next steps](docs/assessment.md) for the decisions taken, risks, and open product questions.

## Local development

The project uses SvelteKit 2, Svelte 5, Vite 7, TypeScript, Tailwind CSS, and Skeleton. It is one SvelteKit application: its hooks, server loads, and form actions run in the app server; no separately hosted API is required. Use Node.js 22.12 or later (the version required by Vite 7), then:

```sh
npm install
npm run dev
```

Set the shared login password and database URL as private server environment variables, for example in a local `.env` file:

```dotenv
APP_PASSWORD=choose-a-strong-shared-password
DATABASE_URL=postgresql://user:password@localhost:5432/carcassonne
```

Everyone signs in on `/` with this one password. Every other page redirects to `/` until the user signs in. Sessions are stored in an `httpOnly` cookie that lasts 30 days. The cookie is signed with the current password. To rotate the password, change `APP_PASSWORD` and restart the server; this signs out every existing session. If `APP_PASSWORD` is unset, login is refused. Never expose it as a `PUBLIC_` variable. Login is not yet rate limited, so add rate limiting and HTTPS before exposing the app publicly.

### Running with Aspire (optional)

An [Aspire](https://aspire.dev) TypeScript AppHost in `aspire-apphost/` starts the app and a local Postgres database. It is optional; `npm run dev` still runs the app on its own, but then you must provide your own `DATABASE_URL`. It registers a Postgres container (with a persistent data volume), a `db-migrate` step that applies Drizzle migrations, and the SvelteKit app, which waits for the migrations and receives `DATABASE_URL`. The Postgres container requires Docker or Podman.

Install the [Aspire CLI](https://aspire.dev/get-started/install-cli/), run `npm install` in `aspire-apphost/` once, and supply the shared password as an Aspire secret parameter:

```sh
cd aspire-apphost && npm install && cd ..
aspire run                # or `aspire start` / `aspire stop`; opens the dashboard
```

On first run the dashboard prompts for the `app-password` parameter. To supply it non-interactively, set the environment variable `Parameters__app-password` (the hyphen means it must be set with `env "Parameters__app-password=..." aspire start`). Do not commit the value. Biome checks `apphost.mts`; `aspire-apphost/.aspire/` is generated and must not be edited.

`aspire init` also installed Aspire agent skills in `.claude/skills/` (including `playwright-cli`). They are vendored third-party content and are excluded from Biome. The Aspire CLI sends usage telemetry for these skills; set `ASPIRE_CLI_TELEMETRY_OPTOUT=true` to opt out.

## Database

Data is stored in Postgres through [Drizzle ORM](https://orm.drizzle.team) with the `postgres` driver. Locally, Aspire runs Postgres in a container; production is planned to use a single Neon instance. Tables: `players`, `games`, `game_players` (a game's players and their meeple colors) and `score_events` (signed points; a player's score is the sum of their events, and Undo deletes the latest one).

- Schema: `src/lib/server/db/schema.ts`; client: `src/lib/server/db/index.ts` (reads the private `DATABASE_URL`).
- `npm run db:generate` creates a migration in `drizzle/` after a schema change; commit the result.
- `npm run db:migrate` applies migrations to `DATABASE_URL`. Aspire runs it automatically for the local database. For production, run it in CD, not at app startup.
- With Neon, use the direct (non-pooled) connection string for `db:migrate`. The pooled string is fine for the running app.

Unit tests use in-memory repositories and need no database. `src/lib/services/gameService.integration.test.ts` runs the real Drizzle repositories and is skipped unless `TEST_DATABASE_URL` is set (see below).

## Checks

```sh
npm run check             # Svelte and TypeScript checks
npm run lint              # Biome formatting and lint checks
npm run test:unit -- --run # Vitest, single run
npm run playwright-test   # Playwright; builds and starts a preview server
npm run build
```

Playwright also requires its browser dependencies (`npx playwright install`). `npm run playwright-test` covers the login screen and the unauthenticated redirect and needs no database.

### Tests that need Postgres

Two kinds of test run against a real database. Both need a **throwaway, freshly migrated** database, so do not point them at data you care about.

```sh
# 1. Create an empty database and apply the migrations to it.
DATABASE_URL=postgresql://user:password@localhost:5432/carcassonne_test npm run db:migrate

# 2. Service tests against the real Drizzle repositories. WARNING: this deletes
#    every row in the players and games tables of that database.
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/carcassonne_test npm run test:unit -- --run

# 3. The end-to-end journey: log in, add players, start a game, score with
#    quick buttons and the keypad, undo, finish, and see it in History.
#    It builds the app, starts a preview server and needs the database to be fresh.
E2E_DATABASE_URL=postgresql://user:password@localhost:5432/carcassonne_test npm run test:e2e
```

With Aspire, start the app host (`aspire start`), copy the Postgres connection string from the dashboard, create a separate empty database in that container (for example `create database carcassonne_test`), and use that name in the URLs above. Without Aspire, any Postgres works, for example `docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:17`. The journey leaves its data behind, so reset the database before running it again.

## Documentation

- [Agent working instructions](agents.md)
- [Repository assessment, suggested priorities, and open questions](docs/assessment.md)
