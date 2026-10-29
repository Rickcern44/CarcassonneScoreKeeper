import { describe, expect, it } from "vitest";
import { isNewChange, parseGameMessage } from "./gameMessages";

describe("parseGameMessage", () => {
	it("reads the three message types", () => {
		expect(
			parseGameMessage(
				'{"type":"changed","eventCount":4,"lastEventId":9,"status":"active"}',
			),
		).toEqual({
			type: "changed",
			eventCount: 4,
			lastEventId: 9,
			status: "active",
		});
		expect(
			parseGameMessage(
				'{"type":"changed","eventCount":0,"lastEventId":null,"status":"active"}',
			),
		).toMatchObject({ lastEventId: null });
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
		'{"type":"changed","eventCount":4,"status":"active"}',
		'{"type":"changed","eventCount":"4","lastEventId":1,"status":"active"}',
		'{"type":"changed","eventCount":4,"lastEventId":1,"status":"gone"}',
		'{"type":"rematch"}',
		'{"type":"other"}',
	])("ignores %j", (raw) => {
		expect(parseGameMessage(raw)).toBeUndefined();
	});
});

describe("isNewChange", () => {
	const message = {
		type: "changed",
		eventCount: 3,
		lastEventId: 7,
		status: "active",
	} as const;
	const shown = { eventCount: 3, lastEventId: 7, status: "active" } as const;

	it("ignores a change the screen already shows", () => {
		expect(isNewChange(message, shown)).toBe(false);
	});

	it("reloads for a different count, last event or status", () => {
		expect(isNewChange(message, { ...shown, eventCount: 2 })).toBe(true);
		expect(isNewChange(message, { ...shown, lastEventId: 6 })).toBe(true);
		expect(isNewChange(message, { ...shown, status: "finished" })).toBe(true);
	});

	it("notices remove-then-add, which leaves the count unchanged", () => {
		// Shown: events 5, 6, 7 (count 3). Remove 7 and add 8: still three events.
		expect(isNewChange({ ...message, lastEventId: 8 }, shown)).toBe(true);
	});
});
