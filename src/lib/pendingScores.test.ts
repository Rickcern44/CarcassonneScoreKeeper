import { describe, expect, it } from "vitest";
import {
	createPendingScores,
	type PendingScore,
	withPending,
} from "./pendingScores";

function setup() {
	let entries: readonly PendingScore[] = [];
	const pending = createPendingScores((next) => {
		entries = next;
	});
	return { pending, entries: () => entries };
}

const detail = {
	players: [
		{ playerId: "a", name: "Ada", score: 5, rank: 1 },
		{ playerId: "b", name: "Ben", score: 3, rank: 2 },
	],
};

describe("withPending", () => {
	it("returns the same object when nothing is pending", () => {
		expect(withPending(detail, [])).toBe(detail);
	});

	it("adds every overlapping tap once and re-ranks", () => {
		const { pending, entries } = setup();
		pending.add("b", 3);
		pending.add("b", 1);
		pending.add("a", -1);

		const shown = withPending(detail, entries());

		expect(shown.players.map((p) => [p.name, p.score, p.rank])).toEqual([
			["Ben", 7, 1],
			["Ada", 4, 2],
		]);
	});
});

describe("createPendingScores", () => {
	it("keeps a saved tap until a reload confirms it", () => {
		const { pending, entries } = setup();
		const id = pending.add("a", 5);
		expect(pending.settled()).toEqual([]);

		pending.finish(id, true);

		// Still shown: the server data on screen does not include it yet.
		expect(withPending(detail, entries()).players[0].score).toBe(10);
		expect(pending.settled()).toEqual([id]);

		pending.drop([id]);
		expect(withPending(detail, entries())).toBe(detail);
		expect(pending.active).toBe(false);
	});

	it("waits for every request before settling, whatever order they finish in", () => {
		const { pending } = setup();
		const first = pending.add("a", 1);
		const second = pending.add("a", 3);

		pending.finish(second, true);
		expect(pending.settled()).toEqual([]);
		expect(pending.inFlight).toBe(true);

		pending.finish(first, true);
		expect(pending.settled().sort()).toEqual([first, second]);
	});

	it("does not drop a tap added while a reload was running", () => {
		const { pending, entries } = setup();
		const first = pending.add("a", 1);
		pending.finish(first, true);
		const ids = pending.settled(); // reload starts
		const second = pending.add("a", 3); // tapped during the reload

		pending.drop(ids); // reload done

		expect(entries().map((e) => e.id)).toEqual([second]);
		expect(pending.settled()).toEqual([]);
	});

	it("rolls a failed tap back and keeps the others", () => {
		const { pending, entries } = setup();
		const ok = pending.add("a", 1);
		const bad = pending.add("a", 5);

		pending.finish(bad, false);
		pending.finish(ok, true);

		expect(withPending(detail, entries()).players[0].score).toBe(6);
		expect(entries().map((e) => e.id)).toEqual([ok]);
	});
});
