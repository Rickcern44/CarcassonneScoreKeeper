# Carcassonne Score Keeper

A work-in-progress scorekeeping tool for the board game Carcassonne. The intended outcome is to track players and scores during a game; the scoring workflow is not implemented yet.

## Current state

The app has a shared-password login, a player list and creation form backed by Postgres (via Drizzle ORM), and an early game setup screen. Starting a game, recording scores, and game history are not implemented in the current UI. See [repository assessment and next steps](docs/assessment.md) for evidence, risks, and open product questions.

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

Data is stored in Postgres through [Drizzle ORM](https://orm.drizzle.team) with the `postgres` driver. Locally, Aspire runs Postgres in a container; production is planned to use a single Neon instance. The only table so far is `players`. Games and scores are not modeled yet.

- Schema: `src/lib/server/db/schema.ts`; client: `src/lib/server/db/index.ts` (reads the private `DATABASE_URL`).
- `npm run db:generate` creates a migration in `drizzle/` after a schema change; commit the result.
- `npm run db:migrate` applies migrations to `DATABASE_URL`. Aspire runs it automatically for the local database. For production, run it in CD, not at app startup.
- With Neon, use the direct (non-pooled) connection string for `db:migrate`. The pooled string is fine for the running app.

Unit tests use an in-memory repository and need no database. The Drizzle repository has not been covered by automated tests; Aspire/Docker integration tests are a separate piece of work.

## Checks

```sh
npm run check             # Svelte and TypeScript checks
npm run lint              # Biome formatting and lint checks
npm run test:unit -- --run # Vitest, single run
npm run playwright-test   # Playwright; builds and starts a preview server
npm run build
```

Playwright also requires its browser dependencies. The Playwright tests cover only the login screen and the unauthenticated redirect, not the product flows. See the assessment for the recorded upgrade baseline and known remaining check failures.

## Documentation

- [Agent working instructions](agents.md)
- [Repository assessment, suggested priorities, and open questions](docs/assessment.md)
