# Agent instructions

## Purpose and context

This repository is a work-in-progress Carcassonne scorekeeping application. Read `README.md` for setup and `docs/assessment.md` for the current implementation, proposed next steps, and unresolved product decisions. Treat that assessment as a snapshot, not a specification; verify relevant code before changing it.

## Working agreement

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
- `src/lib/server/db/`, `drizzle/`: Drizzle schema, client, and migrations. `src/lib/services/`: services, including session signing, the Drizzle-backed player service, and an empty new-game service.
- `aspire-apphost/apphost.mts`: optional Aspire AppHost that runs the app; `aspire-apphost/.aspire/` is generated, never edit it. `.claude/skills/` holds vendored Aspire skills.
- `src/index.test.ts` and `tests/`: Vitest and Playwright tests, respectively.
