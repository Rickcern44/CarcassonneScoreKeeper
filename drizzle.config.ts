import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load .env itself; Aspire and CD set DATABASE_URL directly.
// `generate` does not need it; `migrate` fails without it.
try {
	process.loadEnvFile();
} catch {
	// No .env file.
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/server/db/schema.ts",
	out: "./drizzle",
	dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
