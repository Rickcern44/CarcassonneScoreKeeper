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
	const archived = new Set<string>();
	const active = () => players.filter((player) => !archived.has(player.id));
	return {
		async list() {
			return active();
		},
		async get(id) {
			return active().find((player) => player.id === id);
		},
		async insert(name) {
			const existing = players.find((player) => player.name === name);
			if (existing) {
				if (!archived.delete(existing.id)) return undefined;
				return existing;
			}
			const player = {
				id: randomUUID(),
				name,
				created_at: new Date().toISOString(),
			};
			players.push(player);
			return player;
		},
		async archive(id) {
			if (!active().some((player) => player.id === id)) return false;
			archived.add(id);
			return true;
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

	it("removing a player archives them: hidden from list and get", async () => {
		const service = createPlayerService(createMemoryRepository());
		const { player } = await service.create("Ada");
		await service.create("Ben");

		expect(await service.remove(player?.id ?? "")).toEqual({});
		expect((await service.list()).map((p) => p.name)).toEqual(["Ben"]);
		expect(await service.get(player?.id ?? "")).toBeUndefined();
	});

	it("reports an error when removing an unknown or already removed player", async () => {
		const service = createPlayerService(createMemoryRepository());
		const { player } = await service.create("Ada");

		expect((await service.remove("missing")).error).toBeDefined();
		await service.remove(player?.id ?? "");
		expect((await service.remove(player?.id ?? "")).error).toBeDefined();
	});

	it("re-adding a removed player's name restores the same player", async () => {
		const service = createPlayerService(createMemoryRepository());
		const { player } = await service.create("Ada");
		await service.remove(player?.id ?? "");

		const restored = await service.create("Ada");
		expect(restored.player?.id).toBe(player?.id);
		expect(await service.list()).toHaveLength(1);
	});
});
