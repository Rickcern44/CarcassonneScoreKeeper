import { sql } from "drizzle-orm";
import {
	bigserial,
	foreignKey,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	// Set when a player is removed; the row stays so game history is intact.
	archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const meepleColor = pgEnum("meeple_color", [
	"red",
	"blue",
	"green",
	"yellow",
	"black",
	"gray",
]);

export const gameStatus = pgEnum("game_status", ["active", "finished"]);

export const games = pgTable(
	"games",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		status: gameStatus("status").notNull().default("active"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		finishedAt: timestamp("finished_at", { withTimezone: true }),
	},
	(table) => [
		// At most one game can be active at a time.
		uniqueIndex("games_one_active")
			.on(table.status)
			.where(sql`${table.status} = 'active'`),
	],
);

export const gamePlayers = pgTable(
	"game_players",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => games.id, { onDelete: "cascade" }),
		// Players are archived rather than deleted, so history keeps its rows.
		playerId: uuid("player_id")
			.notNull()
			.references(() => players.id, { onDelete: "restrict" }),
		color: meepleColor("color").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.gameId, table.playerId] }),
		unique("game_players_game_color_unique").on(table.gameId, table.color),
	],
);

/**
 * A player's score is the sum of their events, and undo deletes the latest
 * event (highest `id`), so history and undo come from the same data.
 */
export const scoreEvents = pgTable(
	"score_events",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		gameId: uuid("game_id").notNull(),
		playerId: uuid("player_id").notNull(),
		points: integer("points").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		// The scoring player must be in the game.
		foreignKey({
			columns: [table.gameId, table.playerId],
			foreignColumns: [gamePlayers.gameId, gamePlayers.playerId],
		}).onDelete("cascade"),
	],
);
