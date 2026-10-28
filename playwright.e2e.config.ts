import type { PlaywrightTestConfig } from "@playwright/test";

// End-to-end journey against a real Postgres. Run with `npm run test:e2e`;
// E2E_DATABASE_URL must point at a fresh, migrated database.
const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		"Set E2E_DATABASE_URL to a fresh, migrated Postgres database.",
	);
}

const config: PlaywrightTestConfig = {
	webServer: {
		command: "npm run build && npm run preview",
		port: 4173,
		env: { APP_PASSWORD: "playwright-test", DATABASE_URL: databaseUrl },
	},
	testDir: "tests/e2e",
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	workers: 1,
};

export default config;
