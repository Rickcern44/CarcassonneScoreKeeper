import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "$lib/server/db/schema";
import { createDrizzleGameRepository, createGameService } from "./gameService";
import {
	createDrizzlePlayerRepository,
	createPlayerService,
} from "./playerService";

/**
 * Runs the real Drizzle repositories against Postgres. WARNING: this deletes
 * every row in players, games, game_players and score_events, so point
 * TEST_DATABASE_URL at a throwaway database with migrations applied.
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("game and player services against Postgres", () => {
	const client = postgres(url ?? "", { prepare: false });
	const db = drizzle(client, { schema });
	const getDatabase = () => db;
	const games = createGameService(createDrizzleGameRepository(getDatabase));
	const players = createPlayerService(
		createDrizzlePlayerRepository(getDatabase),
	);

	beforeEach(async () => {
		await db.delete(schema.scoreEvents);
		await db.delete(schema.gamePlayers);
		await db.delete(schema.games);
		await db.delete(schema.players);
	});
	afterAll(() => client.end());

	async function seed(names: string[]) {
		const ids: string[] = [];
		for (const name of names) {
			ids.push((await players.create(name)).player?.id ?? "");
		}
		return ids;
	}
	const colors = ["red", "blue", "green", "yellow"] as const;

	it("runs a whole game: score, undo, rank, finish, history, rematch", async () => {
		const ids = await seed(["Ada", "Ben", "Cleo"]);
		const { game, error } = await games.create(
			ids.map((playerId, i) => ({ playerId, color: colors[i] })),
		);
		expect(error).toBeUndefined();
		const gameId = game?.id ?? "";

		await games.addScore(gameId, ids[0], 5);
		await games.addScore(gameId, ids[1], 12);
		await games.addScore(gameId, ids[1], -2);
		await games.addScore(gameId, ids[2], 7);
		await games.undo(gameId); // removes Cleo's +7

		const detail = await games.get(gameId);
		expect(detail?.eventCount).toBe(3);
		expect(detail?.players.map((p) => [p.name, p.score, p.rank])).toEqual([
			["Ben", 10, 1],
			["Ada", 5, 2],
			["Cleo", 0, 3],
		]);
		expect((await games.getActive())?.game.id).toBe(gameId);

		expect(await games.finish(gameId)).toEqual({});
		expect((await games.addScore(gameId, ids[0], 1)).error).toMatch(/finished/);
		const history = await games.listFinished();
		expect(history).toHaveLength(1);
		expect(history[0].players[0]).toMatchObject({ name: "Ben", score: 10 });

		const rematch = await games.rematch(gameId);
		expect(rematch.game?.status).toBe("active");
		expect((await games.get(rematch.game?.id ?? ""))?.players).toHaveLength(3);
	});

	it("allows only one active game and unique colors", async () => {
		const ids = await seed(["Ada", "Ben"]);
		const entries = ids.map((playerId, i) => ({ playerId, color: colors[i] }));

		expect((await games.create(entries)).game).toBeDefined();
		expect((await games.create(entries)).error).toMatch(/in progress/);
	});

	it("rejects archived players and restores them on re-add", async () => {
		const ids = await seed(["Ada", "Ben"]);
		await players.remove(ids[0]);
		expect(
			(
				await games.create(
					ids.map((playerId, i) => ({ playerId, color: colors[i] })),
				)
			).error,
		).toMatch(/active player/);

		const restored = await players.create("Ada");
		expect(restored.player?.id).toBe(ids[0]);
		expect((await players.create("Ada")).error).toMatch(/already exists/);
		expect((await players.list()).map((p) => p.name)).toEqual(["Ada", "Ben"]);
	});

	it("discards an active game with its scores and keeps finished ones", async () => {
		const ids = await seed(["Ada", "Ben"]);
		const entries = ids.map((playerId, i) => ({ playerId, color: colors[i] }));
		const first = (await games.create(entries)).game?.id ?? "";
		await games.addScore(first, ids[0], 4);
		expect(await games.discard(first)).toEqual({});
		expect(await games.get(first)).toBeUndefined();

		const second = (await games.create(entries)).game?.id ?? "";
		await games.finish(second);
		expect((await games.discard(second)).error).toBeDefined();
		expect(await games.get(second)).toBeDefined();
	});
});
