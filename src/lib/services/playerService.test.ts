import { describe, expect, it } from "vitest";
import { createPlayerStore } from "./playerService";

describe("player store", () => {
	it("creates, lists and gets players", () => {
		const store = createPlayerStore();
		const { player } = store.create("  Ada ");

		expect(player?.name).toBe("Ada");
		expect(store.list()).toEqual([player]);
		expect(store.get(player?.id ?? "")).toEqual(player);
	});

	it("rejects duplicate names", () => {
		const store = createPlayerStore();
		store.create("Ada");

		expect(store.create("Ada").error).toBeDefined();
		expect(store.list()).toHaveLength(1);
	});

	it("rejects empty names", () => {
		const store = createPlayerStore();

		expect(store.create("   ").error).toBeDefined();
		expect(store.list()).toHaveLength(0);
	});

	it("returns undefined for unknown ids", () => {
		expect(createPlayerStore().get("missing")).toBeUndefined();
	});

	it("does not expose its internal list", () => {
		const store = createPlayerStore();
		store.create("Ada");
		store.list().pop();

		expect(store.list()).toHaveLength(1);
	});
});
