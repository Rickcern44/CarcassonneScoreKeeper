import { describe, expect, it } from "vitest";
import { isNewChange, parseGameMessage } from "./gameMessages";

describe("parseGameMessage", () => {
	it("reads the three message types", () => {
		expect(
			parseGameMessage('{"type":"changed","eventCount":4,"status":"active"}'),
		).toEqual({ type: "changed", eventCount: 4, status: "active" });
		expect(parseGameMessage('{"type":"discarded"}')).toEqual({
			type: "discarded",
		});
		expect(parseGameMessage('{"type":"rematch","gameId":"abc"}')).toEqual({
			type: "rematch",
			gameId: "abc",
		});
	});

	it.each([
		"",
		"not json",
		"null",
		'{"type":"changed"}',
		'{"type":"changed","eventCount":"4","status":"active"}',
		'{"type":"changed","eventCount":4,"status":"gone"}',
		'{"type":"rematch"}',
		'{"type":"other"}',
	])("ignores %j", (raw) => {
		expect(parseGameMessage(raw)).toBeUndefined();
	});
});

describe("isNewChange", () => {
	const message = { type: "changed", eventCount: 3, status: "active" } as const;

	it("ignores a change the screen already shows", () => {
		expect(isNewChange(message, { eventCount: 3, status: "active" })).toBe(
			false,
		);
	});

	it("reloads for a different count or status", () => {
		expect(isNewChange(message, { eventCount: 2, status: "active" })).toBe(
			true,
		);
		expect(isNewChange(message, { eventCount: 3, status: "finished" })).toBe(
			true,
		);
	});
});
