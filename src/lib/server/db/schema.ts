import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
