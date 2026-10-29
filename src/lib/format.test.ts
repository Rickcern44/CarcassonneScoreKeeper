import { describe, expect, it } from "vitest";
import {
	formatGameDate,
	joinNames,
	relativeTime,
	signedPoints,
} from "./format";

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

describe("signedPoints", () => {
	it("uses a real minus sign", () => {
		expect(signedPoints(8)).toBe("+8");
		expect(signedPoints(-1)).toBe("−1");
	});
});

describe("relativeTime", () => {
	const now = new Date("2026-03-10T12:00:00Z");
	const ago = (seconds: number) =>
		new Date(now.getTime() - seconds * 1000).toISOString();

	it.each([
		[0, "just now"],
		[30, "just now"],
		[60, "1 min ago"],
		[180, "3 min ago"],
		[3600, "1 hr ago"],
		[7200, "2 hr ago"],
	])("%i seconds ago is %s", (seconds, text) => {
		expect(relativeTime(ago(seconds), now)).toBe(text);
	});

	it("spells units out for screen readers", () => {
		expect(relativeTime(ago(60), now, true)).toBe("1 minute ago");
		expect(relativeTime(ago(180), now, true)).toBe("3 minutes ago");
		expect(relativeTime(ago(7200), now, true)).toBe("2 hours ago");
	});

	it("treats a time slightly in the future (clock skew) as just now", () => {
		expect(relativeTime(ago(-5), now)).toBe("just now");
	});
});
