import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import {
	gamePlayers,
	games,
	players,
	scoreEvents,
} from "$lib/server/db/schema";

export const MEEPLE_COLORS = [
	"red",
	"blue",
	"green",
	"yellow",
	"black",
	"gray",
] as const;
export type MeepleColor = (typeof MEEPLE_COLORS)[number];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export interface Game {
	id: string;
	status: "active" | "finished";
	created_at: string;
	finished_at: string | null;
}

export interface GameEntry {
	playerId: string;
	color: MeepleColor;
}

/** A player in a game with their current total (the sum of their events). */
export interface GamePlayer extends GameEntry {
	name: string;
	score: number;
}

export interface GameRecord {
	game: Game;
	players: GamePlayer[];
}

export interface RankedPlayer extends GamePlayer {
	/** Standard competition rank: equal scores share a rank (1, 1, 3). */
	rank: number;
}

/**
 * A game with players ranked by score. Ties are not stored: everyone with
 * rank 1 is a winner, so winners always follow from the score events.
 */
export interface GameDetail {
	game: Game;
	players: RankedPlayer[];
}

export interface ScoreEvent {
	id: number;
	playerId: string;
	points: number;
}

export type CreateGameResult =
	| { game: Game; error?: undefined }
	| { game?: undefined; error: string };

export type GameActionResult = { error?: string };

/** Why the repository could not create a game. */
export type CreateGameFailure = "game-active" | "unknown-player";

/** Persistence operations the game service needs. */
export interface GameRepository {
	/** Fails when another game is active or a player is missing or archived. */
	create(
		entries: GameEntry[],
	): Promise<{ game: Game } | { failure: CreateGameFailure }>;
	get(id: string): Promise<GameRecord | undefined>;
	getActive(): Promise<GameRecord | undefined>;
	/** Newest finished first. */
	listFinished(): Promise<GameRecord[]>;
	addScoreEvent(
		gameId: string,
		playerId: string,
		points: number,
	): Promise<ScoreEvent>;
	/** Deletes and returns the game's latest event, if it has any. */
	deleteLatestScoreEvent(gameId: string): Promise<ScoreEvent | undefined>;
	/** Returns false unless the game exists and was active. */
	finish(id: string): Promise<boolean>;
}

/** Orders by score (highest first), then name, and assigns tied ranks. */
export function rankPlayers(gamePlayersList: GamePlayer[]): RankedPlayer[] {
	const sorted = [...gamePlayersList].sort(
		(a, b) => b.score - a.score || a.name.localeCompare(b.name),
	);
	return sorted.map((player) => ({
		...player,
		rank: sorted.findIndex((other) => other.score === player.score) + 1,
	}));
}

function toDetail({ game, players: gamePlayersList }: GameRecord): GameDetail {
	return { game, players: rankPlayers(gamePlayersList) };
}

export function createGameService(repository: GameRepository) {
	return {
		async create(entries: GameEntry[]): Promise<CreateGameResult> {
			if (entries.length < MIN_PLAYERS || entries.length > MAX_PLAYERS) {
				return {
					error: `A game needs ${MIN_PLAYERS} to ${MAX_PLAYERS} players.`,
				};
			}
			if (entries.some(({ color }) => !MEEPLE_COLORS.includes(color))) {
				return { error: "Unknown meeple color." };
			}
			if (
				new Set(entries.map((entry) => entry.playerId)).size !== entries.length
			) {
				return { error: "A player can only be in a game once." };
			}
			if (
				new Set(entries.map((entry) => entry.color)).size !== entries.length
			) {
				return { error: "Each player needs a different color." };
			}

			const result = await repository.create(entries);
			if ("game" in result) return { game: result.game };
			return {
				error:
					result.failure === "game-active"
						? "A game is already in progress."
						: "Every player must be an existing, active player.",
			};
		},

		async get(id: string): Promise<GameDetail | undefined> {
			const record = await repository.get(id);
			return record && toDetail(record);
		},

		async getActive(): Promise<GameDetail | undefined> {
			const record = await repository.getActive();
			return record && toDetail(record);
		},

		async listFinished(): Promise<GameDetail[]> {
			return (await repository.listFinished()).map(toDetail);
		},

		/** Points are signed, so a correction is a negative amount. */
		async addScore(
			gameId: string,
			playerId: string,
			points: number,
		): Promise<GameActionResult> {
			if (!Number.isInteger(points) || points === 0) {
				return { error: "Points must be a whole number other than zero." };
			}
			const record = await repository.get(gameId);
			if (!record) return { error: "Game not found." };
			if (record.game.status !== "active") {
				return { error: "This game is finished." };
			}
			if (!record.players.some((player) => player.playerId === playerId)) {
				return { error: "That player is not in this game." };
			}

			await repository.addScoreEvent(gameId, playerId, points);
			return {};
		},

		async undo(gameId: string): Promise<GameActionResult> {
			const record = await repository.get(gameId);
			if (!record) return { error: "Game not found." };
			if (record.game.status !== "active") {
				return { error: "This game is finished." };
			}

			const removed = await repository.deleteLatestScoreEvent(gameId);
			return removed ? {} : { error: "Nothing to undo." };
		},

		async finish(gameId: string): Promise<GameActionResult> {
			const record = await repository.get(gameId);
			if (!record) return { error: "Game not found." };
			const finished = await repository.finish(gameId);
			return finished ? {} : { error: "This game is already finished." };
		},
	};
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toGame(row: typeof games.$inferSelect): Game {
	return {
		id: row.id,
		status: row.status,
		created_at: row.createdAt.toISOString(),
		finished_at: row.finishedAt?.toISOString() ?? null,
	};
}

export function createDrizzleGameRepository(
	getDatabase: typeof getDb = getDb,
): GameRepository {
	async function records(rows: (typeof games.$inferSelect)[]) {
		if (rows.length === 0) return [];
		const gameIds = rows.map((row) => row.id);
		const total = sql<number>`coalesce(sum(${scoreEvents.points}), 0)::int`;
		const playerRows = await getDatabase()
			.select({
				gameId: gamePlayers.gameId,
				playerId: gamePlayers.playerId,
				color: gamePlayers.color,
				name: players.name,
				score: total,
			})
			.from(gamePlayers)
			.innerJoin(players, eq(players.id, gamePlayers.playerId))
			.leftJoin(
				scoreEvents,
				and(
					eq(scoreEvents.gameId, gamePlayers.gameId),
					eq(scoreEvents.playerId, gamePlayers.playerId),
				),
			)
			.where(inArray(gamePlayers.gameId, gameIds))
			.groupBy(gamePlayers.gameId, gamePlayers.playerId, players.name);

		return rows.map((row) => ({
			game: toGame(row),
			players: playerRows
				.filter((player) => player.gameId === row.id)
				.map(({ gameId: _gameId, ...player }) => player),
		}));
	}

	return {
		async create(entries) {
			const db = getDatabase();
			return db.transaction(async (tx) => {
				const found = await tx
					.select({ id: players.id })
					.from(players)
					.where(
						and(
							inArray(
								players.id,
								entries.map((entry) => entry.playerId),
							),
							isNull(players.archivedAt),
						),
					);
				if (found.length !== entries.length) {
					return { failure: "unknown-player" as const };
				}

				// The unique index allows only one active game; losing the race is
				// reported as "game-active".
				const [game] = await tx
					.insert(games)
					.values({})
					.onConflictDoNothing()
					.returning();
				if (!game) return { failure: "game-active" as const };

				await tx.insert(gamePlayers).values(
					entries.map(({ playerId, color }) => ({
						gameId: game.id,
						playerId,
						color,
					})),
				);
				return { game: toGame(game) };
			});
		},
		async get(id) {
			// Non-UUID ids would make Postgres throw rather than match nothing.
			if (!UUID.test(id)) return undefined;
			const rows = await getDatabase()
				.select()
				.from(games)
				.where(eq(games.id, id));
			return (await records(rows))[0];
		},
		async getActive() {
			const rows = await getDatabase()
				.select()
				.from(games)
				.where(eq(games.status, "active"));
			return (await records(rows))[0];
		},
		async listFinished() {
			const rows = await getDatabase()
				.select()
				.from(games)
				.where(eq(games.status, "finished"))
				.orderBy(desc(games.finishedAt));
			return records(rows);
		},
		async addScoreEvent(gameId, playerId, points) {
			const [row] = await getDatabase()
				.insert(scoreEvents)
				.values({ gameId, playerId, points })
				.returning();
			return { id: row.id, playerId: row.playerId, points: row.points };
		},
		async deleteLatestScoreEvent(gameId) {
			const [latest] = await getDatabase()
				.select({ id: scoreEvents.id })
				.from(scoreEvents)
				.where(eq(scoreEvents.gameId, gameId))
				.orderBy(desc(scoreEvents.id))
				.limit(1);
			if (!latest) return undefined;

			const [row] = await getDatabase()
				.delete(scoreEvents)
				.where(eq(scoreEvents.id, latest.id))
				.returning();
			return row && { id: row.id, playerId: row.playerId, points: row.points };
		},
		async finish(id) {
			if (!UUID.test(id)) return false;
			const rows = await getDatabase()
				.update(games)
				.set({ status: "finished", finishedAt: new Date() })
				.where(and(eq(games.id, id), eq(games.status, "active")))
				.returning({ id: games.id });
			return rows.length > 0;
		},
	};
}

export const gameService = createGameService(createDrizzleGameRepository());
