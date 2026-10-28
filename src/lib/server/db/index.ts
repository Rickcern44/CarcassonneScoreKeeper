import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "$app/env/private";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

let db: Database | undefined;

/**
 * Returns the shared database client, created on first use so the app can
 * build and serve the login screen without a database configured.
 */
export function getDb(): Database {
	if (db) return db;

	const url = DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set.");

	// `prepare: false` keeps this working through Neon's pooled (PgBouncer) endpoint.
	db = drizzle(postgres(url, { prepare: false }), { schema });
	return db;
}
