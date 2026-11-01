import { get } from "svelte/store";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isOnline } from "./online";

afterEach(() => {
	vi.unstubAllGlobals();
});

function stubBrowser(onLine: boolean) {
	const target = new EventTarget();
	vi.stubGlobal("window", target);
	vi.stubGlobal("navigator", { onLine });
	return target;
}

describe("isOnline", () => {
	it("starts from navigator.onLine and follows online/offline events", () => {
		const target = stubBrowser(false);
		const seen: boolean[] = [];
		const unsubscribe = isOnline.subscribe((value) => seen.push(value));

		target.dispatchEvent(new Event("online"));
		target.dispatchEvent(new Event("offline"));
		unsubscribe();

		expect(seen).toEqual([false, true, false]);
	});

	it("stops listening when the last subscriber leaves", () => {
		const target = stubBrowser(true);
		const remove = vi.spyOn(target, "removeEventListener");

		isOnline.subscribe(() => {})();

		expect(remove).toHaveBeenCalledWith("online", expect.any(Function));
		expect(remove).toHaveBeenCalledWith("offline", expect.any(Function));
	});

	it("reports online without a window (server rendering)", () => {
		expect(get(isOnline)).toBe(true);
	});
});
