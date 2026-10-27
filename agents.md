# Agent instructions

## Purpose and context

This repository is a work-in-progress Carcassonne scorekeeping application. Read `README.md` for setup and `docs/assessment.md` for the current implementation, proposed next steps, and unresolved product decisions. Treat that assessment as a snapshot, not a specification; verify relevant code before changing it.

## Working agreement

- Follow the user's requested scope. Do not implement proposed roadmap items unless asked.
- Inspect relevant routes, services, tests, and existing changes before editing. Preserve unrelated user work.
- Make focused changes consistent with the existing SvelteKit and TypeScript patterns. Avoid unrelated dependency upgrades or refactors.
- Ask when product rules, data ownership, or other consequential requirements are unclear; do not invent Carcassonne rules or assume expansion support.
- Keep secrets out of the repository, logs, and public client environment variables. Do not make changes to remote Supabase data, configuration, or policies without explicit authorization.
- When behavior changes, add or update relevant tests where practical. Run appropriate checks from the README, and report failures, missing prerequisites, and checks not run honestly. Do not claim existing failures were caused by your change without evidence.
- Update documentation when setup, behavior, or decisions change. Distinguish implemented behavior from plans and assumptions.

## Map

- `src/routes/`: SvelteKit routes and server loads/actions.
- `src/components/`: shared UI, including authentication and navigation.
- `src/hooks.server.ts` and `src/routes/+layout.ts`: Supabase client/session setup.
- `src/lib/services/`: intended service location; currently contains an empty new-game service.
- `src/index.test.ts` and `tests/`: Vitest and Playwright tests, respectively.
