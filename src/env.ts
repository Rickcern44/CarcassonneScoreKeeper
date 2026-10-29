import { defineEnvVars } from "@sveltejs/kit/env";

// Unset variables fall back to "". Every consumer treats "" as not configured
// (the login action and the DB getter reject it; token checks fail closed).
export const variables = defineEnvVars({
	APP_PASSWORD: { schema: (input) => input ?? "" },
	DATABASE_URL: { schema: (input) => input ?? "" },
	// Not a secret. "staging" or "development" mark a deployment; anything else,
	// including unset, is production (see src/lib/appEnv.ts).
	APP_ENV: { schema: (input) => input ?? "" },
});
