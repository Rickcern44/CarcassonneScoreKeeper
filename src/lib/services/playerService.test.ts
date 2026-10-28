import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
	createPlayerService,
	type Player,
	type PlayerRepository,
} from "./playerService";

/** In-memory repository so the service logic is tested without a database. */
function createMemoryRepository(): PlayerRepository {
	const players: Player[] = [];
	return {
		async list() {
			return [...players];
		},
		async get(id) {
			return players.find((player) => player.id === id);
		},
		async insert(name) {
			if (players.some((player) => player.name === name)) return undefined;
			const player = {
				id: randomUUID(),
				name,
				created_at: new Date().toISOString(),
			};
			players.push(player);
			return player;
		},
	};
}

describe("player service", () => {
	it("creates, lists and gets players", async () => {
		const service = createPlayerService(createMemoryRepository());
		const { player } = await service.create("  Ada ");

		expect(player?.name).toBe("Ada");
		expect(await service.list()).toEqual([player]);
		expect(await service.get(player?.id ?? "")).toEqual(player);
	});

	it("rejects duplicate names", async () => {
		const service = createPlayerService(createMemoryRepository());
		await service.create("Ada");

		expect((await service.create("Ada")).error).toBeDefined();
		expect(await service.list()).toHaveLength(1);
	});

	it("rejects empty names without calling the repository", async () => {
		const repository = createMemoryRepository();
		const service = createPlayerService(repository);

		expect((await service.create("   ")).error).toBeDefined();
		expect(await repository.list()).toHaveLength(0);
	});

	it("returns undefined for unknown ids", async () => {
		const service = createPlayerService(createMemoryRepository());

		expect(await service.get("missing")).toBeUndefined();
	});
});
