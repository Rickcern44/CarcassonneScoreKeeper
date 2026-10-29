import { describe, expect, it, vi } from "vitest";
import { createGameEvents } from "./gameEvents";

describe("gameEvents", () => {
	it("delivers a message to subscribers of that game only", () => {
		const events = createGameEvents();
		const a = vi.fn();
		const b = vi.fn();
		events.subscribe("game-a", a);
		events.subscribe("game-b", b);

		events.publish("game-a", { type: "discarded" });

		expect(a).toHaveBeenCalledWith({ type: "discarded" });
		expect(b).not.toHaveBeenCalled();
	});

	it("stops delivering after unsubscribe and forgets empty games", () => {
		const events = createGameEvents();
		const listener = vi.fn();
		const unsubscribe = events.subscribe("g", listener);
		expect(events.subscriberCount("g")).toBe(1);

		unsubscribe();
		events.publish("g", { type: "discarded" });

		expect(listener).not.toHaveBeenCalled();
		expect(events.subscriberCount()).toBe(0);
	});

	it("keeps delivering when one listener throws", () => {
		const events = createGameEvents();
		const survivor = vi.fn();
		events.subscribe("g", () => {
			throw new Error("boom");
		});
		events.subscribe("g", survivor);

		expect(() => events.publish("g", { type: "discarded" })).not.toThrow();
		expect(survivor).toHaveBeenCalledOnce();
	});

	it("allows a listener to unsubscribe while a message is delivered", () => {
		const events = createGameEvents();
		const second = vi.fn();
		const unsubscribe = events.subscribe("g", () => unsubscribe());
		events.subscribe("g", second);

		events.publish("g", { type: "discarded" });

		expect(second).toHaveBeenCalledOnce();
	});
});
