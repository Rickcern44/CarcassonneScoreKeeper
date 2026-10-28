# Agent instructions

## Purpose and context

This repository is a work-in-progress Carcassonne scorekeeping application. Read `README.md` for setup and `docs/assessment.md` for the current implementation, proposed next steps, and unresolved product decisions. Treat that assessment as a snapshot, not a specification; verify relevant code before changing it.

## Working agreement

- Work is tracked in GitHub issues (`gh issue list`, `gh issue view <n> --comments`). When the user refers to a task by name or number (for example "the app shell"), find the matching issue and treat its scope, out-of-scope, and done-when sections as the brief. Reference the issue in branch names, commits, and PRs.
- `main` is the default branch. Start new work from an up-to-date `main` (`git fetch`, then branch from `origin/main`) and open PRs against `main`. Do not base work on `development` or on other feature branches unless asked.
- Merging to `main` deploys an ephemeral staging (a Neon branch of production plus a `-staging` Fly app) through `.github/workflows/cd.yml`. Production deploys only after the user approves the `production` environment gate in that workflow. Never push to `main` directly; open a PR. Do not change the Fly.io apps, the Neon database or branches, or GitHub secrets without explicit authorization, and never put their values in the repository or in chat.
- Follow the user's requested scope. Do not implement proposed roadmap items unless asked.
- Inspect relevant routes, services, tests, and existing changes before editing. Preserve unrelated user work.
- Make focused changes consistent with the existing SvelteKit and TypeScript patterns. Avoid unrelated dependency upgrades or refactors.
- Ask when product rules, data ownership, or other consequential requirements are unclear; do not invent Carcassonne rules or assume expansion support.
- Keep secrets out of the repository, logs, and public client environment variables. Supabase has been removed from the code; do not change any remaining remote Supabase project or data without explicit authorization.
- When behavior changes, add or update relevant tests where practical. Run appropriate checks from the README, and report failures, missing prerequisites, and checks not run honestly. Do not claim existing failures were caused by your change without evidence.
- Update documentation when setup, behavior, or decisions change. Distinguish implemented behavior from plans and assumptions.

## Map

- `src/routes/`: SvelteKit routes and server loads/actions.
- `src/components/`: shared UI, including authentication and navigation.
- `src/hooks.server.ts`: shared-password session check and route guard; login and logout actions are in `src/routes/+page.server.ts`.
- `src/lib/server/db/`, `drizzle/`: Drizzle schema, client, and migrations. `src/lib/services/`: services, including session signing, the Drizzle-backed player and game services (repository pattern, unit-tested with in-memory repositories).
- `aspire-apphost/apphost.mts`: optional Aspire AppHost that runs the app; `aspire-apphost/.aspire/` is generated, never edit it. `.claude/skills/` holds vendored Aspire skills.
- `.github/workflows/ci.yml`: CI for every PR (also called by CD). `.github/workflows/cd.yml`: on `main`, runs CI, then deploys ephemeral staging. after approval it migrates production with `scripts/migrate.mjs`, deploys, and tears staging down via `staging-teardown.yml`; shared deploy steps in `.github/actions/fly-deploy`. `Dockerfile`, `fly.toml`: the production image and Fly settings.
- `src/index.test.ts` and `tests/`: Vitest and Playwright tests, respectively.
