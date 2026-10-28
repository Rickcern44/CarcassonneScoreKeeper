// Applies the Drizzle migrations in ./drizzle. Runs in the production image
// (as Fly's release command) and in CI, so it only needs runtime dependencies.
// Prefer MIGRATE_DATABASE_URL: with Neon that should be the direct
// (non-pooled) connection string.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
	console.error("Set MIGRATE_DATABASE_URL or DATABASE_URL.");
	process.exit(1);
}

const client = postgres(url, { max: 1, prepare: false });
try {
	await migrate(drizzle(client), { migrationsFolder: "drizzle" });
	console.log("Migrations applied.");
} catch (error) {
	console.error("Migration failed:", error);
	process.exitCode = 1;
} finally {
	await client.end();
}
