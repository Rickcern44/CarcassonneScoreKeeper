import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	// Set when a player is removed; the row stays so game history is intact.
	archivedAt: timestamp("archived_at", { withTimezone: true }),
});
