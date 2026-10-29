import { describe, expect, it } from "vitest";
import { buildLogRows } from "./scoreLog";

const players = [
	{ playerId: "a", name: "Ada", color: "red" as const },
	{ playerId: "b", name: "Ben", color: "blue" as const },
];
const saved = [
	{
		id: 7,
		name: "Ben",
		color: "blue" as const,
		points: 3,
		runningTotal: 3,
		createdAt: "2026-03-10T12:00:00Z",
	},
];

describe("buildLogRows", () => {
	it("shows saved entries as they are", () => {
		expect(buildLogRows(players, [], saved)).toEqual([
			expect.objectContaining({ key: "entry-7", eventId: 7, runningTotal: 3 }),
		]);
	});

	it("puts taps still saving first, newest first, and not removable", () => {
		const rows = buildLogRows(
			players,
			[
				{ id: 1, playerId: "a", points: 5, done: true },
				{ id: 2, playerId: "b", points: -1, done: false },
			],
			saved,
		);
		expect(
			rows.map((r) => [r.key, r.name, r.points, r.saving ?? false]),
		).toEqual([
			["saving-2", "Ben", -1, true],
			["saving-1", "Ada", 5, true],
			["entry-7", "Ben", 3, false],
		]);
		expect(rows[0].eventId).toBeUndefined();
	});
});
