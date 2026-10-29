import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameEvents } from "./gameEvents";
import { gameEventStream } from "./gameStream";

const decoder = new TextDecoder();

beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	vi.useRealTimers();
});

/** Reads whatever is queued right now without waiting for more. */
async function readNext(reader: ReadableStreamDefaultReader<Uint8Array>) {
	const { value } = await reader.read();
	return decoder.decode(value);
}

describe("gameEventStream", () => {
	it("sends changes for its game as data lines", async () => {
		const events = createGameEvents();
		const reader = gameEventStream("g", events).getReader();
		expect(await readNext(reader)).toContain(": connected");

		events.publish("other", { type: "discarded" });
		events.publish("g", { type: "changed", eventCount: 3, status: "active" });

		expect(await readNext(reader)).toBe(
			'data: {"type":"changed","eventCount":3,"status":"active"}\n\n',
		);
	});

	it("pings while idle", async () => {
		const reader = gameEventStream(
			"g",
			createGameEvents(),
			undefined,
			1000,
		).getReader();
		await readNext(reader);

		vi.advanceTimersByTime(1000);

		expect(await readNext(reader)).toBe(": ping\n\n");
	});

	it("unsubscribes and stops pinging when the reader cancels", async () => {
		const events = createGameEvents();
		const reader = gameEventStream("g", events).getReader();
		await readNext(reader);
		expect(events.subscriberCount("g")).toBe(1);

		await reader.cancel();

		expect(events.subscriberCount()).toBe(0);
		expect(vi.getTimerCount()).toBe(0);
	});

	it("cleans up when the request is aborted", async () => {
		const events = createGameEvents();
		const controller = new AbortController();
		const reader = gameEventStream("g", events, controller.signal).getReader();
		await readNext(reader);

		controller.abort();

		expect(events.subscriberCount()).toBe(0);
		expect(vi.getTimerCount()).toBe(0);
		expect((await reader.read()).done).toBe(true);
	});

	it("does not subscribe for a request that is already aborted", () => {
		const events = createGameEvents();
		const controller = new AbortController();
		controller.abort();

		gameEventStream("g", events, controller.signal);

		expect(events.subscriberCount()).toBe(0);
		expect(vi.getTimerCount()).toBe(0);
	});
});
