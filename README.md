# Carcassonne Score Keeper

A work-in-progress scorekeeping tool for the board game Carcassonne. The intended outcome is to track players and scores during a game; the scoring workflow is not implemented yet.

## Current state

The app has Supabase authentication, a player list and creation form, and an early game setup screen. Starting a game, recording scores, and game history are not implemented in the current UI. See [repository assessment and next steps](docs/assessment.md) for evidence, risks, and open product questions.

## Local development

The project uses SvelteKit 2, Svelte 5, Vite 7, TypeScript, Tailwind CSS, Skeleton, and Supabase. It is one SvelteKit application: its hooks, server loads, and form actions run in the app server; no separately hosted API is required. Use Node.js 22.12 or later (the version required by Vite 7), then:

```sh
npm install
npm run dev
```

The app imports these public environment variables from a local `.env` file:

```dotenv
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_KEY=your_supabase_public_key
PUBLIC_ENVIRONMENT=Development
```

Use a Supabase public client key, never a service-role key in a `PUBLIC_` variable. `PUBLIC_ENVIRONMENT` is used for development logging. The app expects a Supabase `Players` table with at least `id` and `name`; its complete schema, policies, and setup are not recorded in this repository. Authentication and player functionality require an appropriately configured Supabase project. Do not assume that a fresh project will work without further setup.

## Checks

```sh
npm run check             # Svelte and TypeScript checks
npm run lint              # Prettier and ESLint
npm run test:unit -- --run # Vitest, single run
npm run playwright-test   # Playwright; builds and starts a preview server
npm run build
```

Playwright also requires its browser dependencies. Checks may require the environment variables above; the existing tests are starter examples, not coverage of the product. See the assessment for the recorded upgrade baseline and known remaining check failures.

## Documentation

- [Agent working instructions](agents.md)
- [Repository assessment, suggested priorities, and open questions](docs/assessment.md)
