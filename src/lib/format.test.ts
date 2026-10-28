import { describe, expect, it } from "vitest";
import { formatGameDate, joinNames } from "./format";

const now = new Date(2026, 9, 28, 15, 0); // Wed 28 Oct 2026, local time

describe("formatGameDate", () => {
	it("labels today and yesterday", () => {
		expect(formatGameDate(new Date(2026, 9, 28, 1, 0).toISOString(), now)).toBe(
			"Today",
		);
		expect(
			formatGameDate(new Date(2026, 9, 27, 23, 0).toISOString(), now),
		).toBe("Yesterday");
	});

	it("uses the weekday within the last week", () => {
		const label = formatGameDate(
			new Date(2026, 9, 24, 12, 0).toISOString(),
			now,
		);
		expect(label).toBe(
			new Date(2026, 9, 24).toLocaleDateString(undefined, { weekday: "long" }),
		);
	});

	it("uses a date for older games, with the year only when it differs", () => {
		const older = formatGameDate(
			new Date(2026, 9, 1, 12, 0).toISOString(),
			now,
		);
		expect(older).toMatch(/1/);
		expect(older).not.toMatch(/2026/);
		expect(
			formatGameDate(new Date(2025, 9, 1, 12, 0).toISOString(), now),
		).toMatch(/2025/);
	});
});

describe("joinNames", () => {
	it("joins with commas and an ampersand", () => {
		expect(joinNames([])).toBe("");
		expect(joinNames(["Ben"])).toBe("Ben");
		expect(joinNames(["Ben", "Ada"])).toBe("Ben & Ada");
		expect(joinNames(["Ben", "Ada", "Cleo"])).toBe("Ben, Ada & Cleo");
	});
});
