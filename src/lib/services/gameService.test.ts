import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
	createGameService,
	type Game,
	type GameEntry,
	type GamePlayer,
	type GameRecord,
	type GameRepository,
	MAX_PLAYERS,
	type MeepleColor,
	rankPlayers,
	type ScoreEvent,
} from "./gameService";

const COLORS: MeepleColor[] = [
	"red",
	"blue",
	"green",
	"yellow",
	"black",
	"gray",
];
const NAMES = ["Ada", "Ben", "Cleo", "Dev", "Eli", "Fay", "Gus"];

/** In-memory repository mirroring the Drizzle one, so rules run without a database. */
function createMemoryRepository() {
	const players = new Map<string, string>(); // id -> name
	const archived = new Set<string>();
	const games: Game[] = [];
	const members = new Map<string, GameEntry[]>(); // gameId -> entries
	const events: (ScoreEvent & { gameId: string })[] = [];
	let nextEventId = 1;

	const record = (game: Game): GameRecord => ({
		game,
		players: (members.get(game.id) ?? []).map(
			({ playerId, color }): GamePlayer => ({
				playerId,
				color,
				name: players.get(playerId) ?? "",
				score: events
					.filter((e) => e.gameId === game.id && e.playerId === playerId)
					.reduce((sum, e) => sum + e.points, 0),
			}),
		),
	});

	const repository: GameRepository = {
		async create(entries) {
			if (
				entries.some(
					({ playerId }) => !players.has(playerId) || archived.has(playerId),
				)
			) {
				return { failure: "unknown-player" };
			}
			if (games.some((game) => game.status === "active")) {
				return { failure: "game-active" };
			}
			const game: Game = {
				id: randomUUID(),
				status: "active",
				created_at: new Date().toISOString(),
				finished_at: null,
			};
			games.push(game);
			members.set(game.id, entries);
			return { game };
		},
		async get(id) {
			const game = games.find((g) => g.id === id);
			return game && record(game);
		},
		async getActive() {
			const game = games.find((g) => g.status === "active");
			return game && record(game);
		},
		async listFinished() {
			return games
				.filter((g) => g.status === "finished")
				.sort((a, b) =>
					(b.finished_at ?? "").localeCompare(a.finished_at ?? ""),
				)
				.map(record);
		},
		async addScoreEvent(gameId, playerId, points) {
			const event = { id: nextEventId++, gameId, playerId, points };
			events.push(event);
			return { id: event.id, playerId, points };
		},
		async deleteLatestScoreEvent(gameId) {
			const index = events.map((e) => e.gameId).lastIndexOf(gameId);
			if (index === -1) return undefined;
			const [removed] = events.splice(index, 1);
			return {
				id: removed.id,
				playerId: removed.playerId,
				points: removed.points,
			};
		},
		async finish(id) {
			const game = games.find((g) => g.id === id);
			if (game?.status !== "active") return false;
			game.status = "finished";
			game.finished_at = new Date(Date.now() + games.length).toISOString();
			return true;
		},
	};

	return {
		repository,
		addPlayer(name: string) {
			const id = randomUUID();
			players.set(id, name);
			return id;
		},
		archivePlayer: (id: string) => archived.add(id),
	};
}

function setup(playerCount = 3) {
	const memory = createMemoryRepository();
	const service = createGameService(memory.repository);
	const ids = NAMES.slice(0, playerCount).map((name) => memory.addPlayer(name));
	const entries = ids.map((playerId, i) => ({ playerId, color: COLORS[i] }));
	return { ...memory, service, ids, entries };
}

async function startGame(playerCount = 3) {
	const context = setup(playerCount);
	const { game } = await context.service.create(context.entries);
	return { ...context, gameId: game?.id ?? "" };
}

describe("creating a game", () => {
	it("creates an active game with the chosen colors and zero scores", async () => {
		const { service, entries } = setup();
		const result = await service.create(entries);

		expect(result.game?.status).toBe("active");
		const detail = await service.get(result.game?.id ?? "");
		expect(detail?.players.map((p) => [p.color, p.score])).toEqual(
			entries.map((e) => [e.color, 0]),
		);
	});

	it("enforces 2 to 6 players", async () => {
		const tooFew = setup(1);
		expect((await tooFew.service.create(tooFew.entries)).error).toBeDefined();

		const tooMany = setup(MAX_PLAYERS + 1);
		const seven = tooMany.ids.map((playerId, i) => ({
			playerId,
			color: COLORS[i % COLORS.length],
		}));
		expect((await tooMany.service.create(seven)).error).toBeDefined();

		const six = setup(MAX_PLAYERS);
		expect((await six.service.create(six.entries)).game).toBeDefined();
	});

	it("rejects duplicate colors, duplicate players and unknown colors", async () => {
		const { service, ids } = setup();
		const dupColor = ids.map((playerId) => ({
			playerId,
			color: "red" as const,
		}));
		const dupPlayer = [
			{ playerId: ids[0], color: "red" as const },
			{ playerId: ids[0], color: "blue" as const },
		];
		const badColor = [
			{ playerId: ids[0], color: "red" as const },
			{ playerId: ids[1], color: "pink" as unknown as MeepleColor },
		];

		expect((await service.create(dupColor)).error).toBeDefined();
		expect((await service.create(dupPlayer)).error).toBeDefined();
		expect((await service.create(badColor)).error).toBeDefined();
		expect(await service.getActive()).toBeUndefined();
	});

	it("allows only one active game at a time", async () => {
		const { service, entries, gameId } = await startGame();

		expect((await service.create(entries)).error).toMatch(/in progress/);
		expect((await service.getActive())?.game.id).toBe(gameId);

		await service.finish(gameId);
		expect((await service.create(entries)).game).toBeDefined();
	});

	it("rejects missing or archived players", async () => {
		const { service, entries, archivePlayer } = setup();
		archivePlayer(entries[0].playerId);
		expect((await service.create(entries)).error).toMatch(/active player/);

		const fresh = setup();
		const unknown = [
			...fresh.entries.slice(1),
			{ playerId: randomUUID(), color: "gray" as const },
		];
		expect((await fresh.service.create(unknown)).error).toMatch(
			/active player/,
		);
	});
});

describe("scoring", () => {
	it("sums signed events into scores, ranked highest first", async () => {
		const { service, gameId, ids } = await startGame();
		await service.addScore(gameId, ids[0], 5);
		await service.addScore(gameId, ids[1], 12);
		await service.addScore(gameId, ids[0], 4);
		await service.addScore(gameId, ids[1], -3);

		const detail = await service.get(gameId);
		expect(detail?.players.map((p) => [p.name, p.score, p.rank])).toEqual([
			["Ada", 9, 1],
			["Ben", 9, 1],
			["Cleo", 0, 3],
		]);
	});

	it("rejects zero, fractional and non-finite points", async () => {
		const { service, gameId, ids } = await startGame();
		for (const points of [0, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(
				(await service.addScore(gameId, ids[0], points)).error,
			).toBeDefined();
		}
		expect(
			(await service.get(gameId))?.players.every((p) => p.score === 0),
		).toBe(true);
	});

	it("rejects scoring for players outside the game or unknown games", async () => {
		const { service, gameId } = await startGame();
		expect((await service.addScore(gameId, randomUUID(), 3)).error).toMatch(
			/not in this game/,
		);
		expect((await service.addScore("missing", randomUUID(), 3)).error).toMatch(
			/not found/,
		);
	});

	it("rejects scoring and undo once the game is finished", async () => {
		const { service, gameId, ids } = await startGame();
		await service.addScore(gameId, ids[0], 7);
		await service.finish(gameId);

		expect((await service.addScore(gameId, ids[0], 1)).error).toMatch(
			/finished/,
		);
		expect((await service.undo(gameId)).error).toMatch(/finished/);
		expect((await service.get(gameId))?.players[0].score).toBe(7);
	});
});

describe("undo", () => {
	it("removes the latest event only, across players", async () => {
		const { service, gameId, ids } = await startGame();
		await service.addScore(gameId, ids[0], 5);
		await service.addScore(gameId, ids[1], 8);
		await service.addScore(gameId, ids[0], 3);

		expect(await service.undo(gameId)).toEqual({});
		const scores = Object.fromEntries(
			((await service.get(gameId))?.players ?? []).map((p) => [
				p.name,
				p.score,
			]),
		);
		expect(scores).toEqual({ Ada: 5, Ben: 8, Cleo: 0 });

		await service.undo(gameId);
		await service.undo(gameId);
		expect((await service.undo(gameId)).error).toMatch(/nothing to undo/i);
	});

	it("reports unknown games", async () => {
		const { service } = setup();
		expect((await service.undo("missing")).error).toMatch(/not found/);
	});
});

describe("finishing and history", () => {
	it("finishes once and lists finished games newest first with ranked scores", async () => {
		const { service, entries, ids, gameId } = await startGame();
		await service.addScore(gameId, ids[2], 10);
		expect(await service.finish(gameId)).toEqual({});
		expect((await service.finish(gameId)).error).toMatch(/already finished/);
		expect((await service.finish("missing")).error).toMatch(/not found/);

		const second = (await service.create(entries)).game?.id ?? "";
		expect(await service.listFinished()).toHaveLength(1);
		await service.finish(second);

		const finished = await service.listFinished();
		expect(finished.map((g) => g.game.id)).toEqual([second, gameId]);
		expect(finished[1].players[0]).toMatchObject({
			name: "Cleo",
			score: 10,
			rank: 1,
		});
		expect(finished[1].game.finished_at).not.toBeNull();
	});

	it("represents ties as shared rank 1 rather than a stored winner", async () => {
		const { service, gameId, ids } = await startGame(2);
		await service.addScore(gameId, ids[0], 20);
		await service.addScore(gameId, ids[1], 20);
		await service.finish(gameId);

		const [game] = await service.listFinished();
		const winners = game.players.filter((p) => p.rank === 1).map((p) => p.name);
		expect(winners).toEqual(["Ada", "Ben"]);
	});
});

describe("rankPlayers", () => {
	it("uses competition ranking and breaks display order ties by name", () => {
		const make = (name: string, score: number): GamePlayer => ({
			playerId: name,
			name,
			score,
			color: "red",
		});
		expect(
			rankPlayers([
				make("Cleo", 5),
				make("Ben", 9),
				make("Ada", 9),
				make("Dev", 1),
			]).map((p) => [p.name, p.rank]),
		).toEqual([
			["Ada", 1],
			["Ben", 1],
			["Cleo", 3],
			["Dev", 4],
		]);
	});
});
