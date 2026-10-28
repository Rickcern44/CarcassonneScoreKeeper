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
- `npm run db:migrate` applies migrations to `DATABASE_URL`. Aspire runs it automatically for the local database. In production the CD workflow runs `scripts/migrate.mjs` before each deploy, never the app at startup.
- With Neon, use the direct (non-pooled) connection string for migrations (`MIGRATE_DATABASE_URL`). The pooled string is fine for the running app (`DATABASE_URL`).

Unit tests use in-memory repositories and need no database. `src/lib/services/gameService.integration.test.ts` runs the real Drizzle repositories and is skipped unless `TEST_DATABASE_URL` is set (see below).

## Checks

```sh
npm run check             # Svelte and TypeScript checks
npm run lint              # Biome formatting and lint checks
npm run test:unit -- --run # Vitest, single run
npm run playwright-test   # Playwright; builds and starts a preview server
npm run build
```

CI runs the same commands. Playwright also requires its browser dependencies (`npx playwright install`). `npm run playwright-test` covers the login screen and the unauthenticated redirect and needs no database.

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

## CI/CD and deployment

GitHub Actions, with no conditions to read: CI checks, CD builds an ephemeral staging, Release promotes to production.

| Workflow                                 | Runs on                               | What it does                                                                                                                              |
| ---------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`               | every pull request (and called by CD) | `check`, `lint`, unit tests, build, the login Playwright tests; the service tests and the e2e journey against Postgres service containers |
| `.github/workflows/cd.yml`               | every push to `main`                  | runs `ci.yml`, then **Deploy staging**: a fresh Neon branch of the production database, migrated, plus a Fly app `<app>-staging`          |
| `.github/workflows/release.yml`          | started by hand (Actions tab)         | **Migrate and deploy production** for a ref (default `main`), then calls the teardown workflow                                            |
| `.github/workflows/staging-teardown.yml` | after a release, or by hand           | destroys the staging Fly app and deletes the `staging` Neon branch                                                                        |

If CI fails, no staging is built. Staging is **ephemeral**: each merge deletes the previous `staging` Neon branch and creates a new one from production (copy-on-write, so it holds a copy of the real data and rehearses the migration against it), runs `scripts/migrate.mjs` on it, and deploys to `https://<app>-staging.fly.dev` with the same login password. The branch also expires after 14 days by itself. When staging looks right, run the **Release** workflow: it migrates production (`MIGRATE_DATABASE_URL`, falling back to `DATABASE_URL`), deploys with `flyctl deploy --remote-only` (Fly builds the `Dockerfile`, a SvelteKit `adapter-node` server), smoke tests the login page, then tears staging down. A failed migration stops the release before the new code ships. Deploys are serialized and never cancelled half way. The shared deploy steps live in `.github/actions/fly-deploy`. Fly settings (region, machine size, health check) live in `fly.toml`; each app runs a single machine.

Release builds the chosen ref again from source rather than reusing the staging image, so release the commit staging is running (the default `main` is that commit unless something merged since).

Because the database is migrated before the new code goes live (and the previous version keeps serving until then), keep migrations backward compatible: add columns and tables; do not drop or rename in the same release as the code that stops using them. If a deploy fails after its migration ran, the database stays ahead of the running code, which is safe for additive migrations.

### One-time setup

Infrastructure is not managed as code yet, so these are done by hand once:

1. **Neon:** create a project (the free plan works) in a region near your Fly region. Copy two connection strings from its default (production) branch: the pooled one (host contains `-pooler`) for the app, and the direct one for migrations. Also copy the project ID (Settings) and create an API key (Account settings > API keys) so the pipeline can branch the database.
2. **Fly.io:** run `fly auth login`, then create an organization-scoped token with `fly tokens create org`. An org token lets the pipeline create and destroy apps.
3. **GitHub:** add these repository secrets (for example with `gh secret set NAME`, pasting the value when prompted), and never commit them.

   | Secret                 | Value                                                                                        |
   | ---------------------- | -------------------------------------------------------------------------------------------- |
   | `FLY_API_TOKEN`        | the org token from step 2                                                                    |
   | `APP_PASSWORD`         | the shared login password (staging uses it too)                                              |
   | `DATABASE_URL`         | Neon pooled connection string (production branch)                                            |
   | `MIGRATE_DATABASE_URL` | Neon direct connection string, used only to migrate (optional; falls back to `DATABASE_URL`) |
   | `NEON_API_KEY`         | the Neon API key from step 1                                                                 |

   And a repository variable `NEON_PROJECT_ID` (`gh variable set NEON_PROJECT_ID`). Optionally add the variable `FLY_ORG` (defaults to `personal`) and, under Settings > Environments > `production`, require a reviewer so releases wait for approval.
4. **`fly.toml`:** change `app` (it must be unique across Fly) and `primary_region` if you like. Staging uses `<app>-staging`.
5. Merge to `main`. CD creates the staging app and Neon branch and deploys it. Run **Release** from the Actions tab to create the production app, migrate and deploy it at `https://<app>.fly.dev`.

### Operating it

- Roll back with `fly releases` and `fly deploy --image <previous image>`, or revert the commit and release again. Migrations only go forward, so a rollback does not undo schema changes.
- Rotate the login password by updating the `APP_PASSWORD` secret, then merge or re-run the workflows; this signs everyone out.
- Staging holds a copy of production data, including players and games. Do not share its URL more widely than production's.
- Neon's database and role names are the action's defaults (`neondb`, `neondb_owner`); if yours differ, set `database` and `role` on the branch step in `cd.yml`.
- `docker build .` builds the same image locally, and `docker run -p 3000:3000 -e APP_PASSWORD=... -e DATABASE_URL=... <image>` runs it.
- Not set up yet: infrastructure as code, PR preview deploys, and login rate limiting.

## Documentation

- [Agent working instructions](agents.md)
- [Repository assessment, suggested priorities, and open questions](docs/assessment.md)
