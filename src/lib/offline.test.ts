import { describe, expect, it, vi } from "vitest";
import {
	clearDataCaches,
	isDataRequest,
	isLoginPath,
	isOfflineViewable,
	isStorable,
	pagePathname,
} from "./offline";

const response = (init: {
	status?: number;
	redirected?: boolean;
	cacheControl?: string;
}) => ({
	status: init.status ?? 200,
	redirected: init.redirected ?? false,
	headers: {
		get: (name: string) =>
			name.toLowerCase() === "cache-control"
				? (init.cacheControl ?? null)
				: null,
	},
});

describe("isOfflineViewable", () => {
	it.each([
		"/home",
		"/history",
		"/players",
		"/players/ada",
		"/game/3f2c1a",
		"/home/__data.json",
		"/game/3f2c1a/__data.json",
		"/players/ada/__data.json",
	])("allows %s", (path) => {
		expect(isOfflineViewable(path)).toBe(true);
	});

	it.each([
		"/",
		"/__data.json",
		"/newgame",
		"/settings",
		"/test",
		"/game",
		"/players/ada/extra",
		"/_app/immutable/entry/app.js",
		"/manifest.webmanifest",
	])("rejects %s", (path) => {
		expect(isOfflineViewable(path)).toBe(false);
	});
});

describe("path helpers", () => {
	it("strips the data-request suffix", () => {
		expect(pagePathname("/history/__data.json")).toBe("/history");
		expect(pagePathname("/__data.json")).toBe("/");
		expect(pagePathname("/history")).toBe("/history");
	});

	it("recognises data requests and the login path", () => {
		expect(isDataRequest("/home/__data.json")).toBe(true);
		expect(isDataRequest("/home")).toBe(false);
		expect(isLoginPath("/")).toBe(true);
		expect(isLoginPath("/__data.json")).toBe(true);
		expect(isLoginPath("/home")).toBe(false);
	});
});

describe("isStorable", () => {
	it("stores a plain 200", () => {
		expect(isStorable(response({}))).toBe(true);
	});

	it("never stores redirected, non-200 or no-store responses", () => {
		expect(isStorable(response({ redirected: true }))).toBe(false);
		expect(isStorable(response({ status: 302 }))).toBe(false);
		expect(isStorable(response({ status: 404 }))).toBe(false);
		expect(isStorable(response({ cacheControl: "private, no-store" }))).toBe(
			false,
		);
	});

	it("allows other cache-control values", () => {
		expect(isStorable(response({ cacheControl: "private, max-age=0" }))).toBe(
			true,
		);
	});
});

describe("clearDataCaches", () => {
	it("deletes only the saved-data caches", async () => {
		const deleted: string[] = [];
		await clearDataCaches({
			keys: async () => ["app-1", "data-1", "data-2"],
			delete: async (name: string) => {
				deleted.push(name);
				return true;
			},
		});
		expect(deleted).toEqual(["data-1", "data-2"]);
	});

	it("does nothing without Cache Storage and never throws", async () => {
		await expect(clearDataCaches(undefined)).resolves.toBeUndefined();
		const failing = {
			keys: vi.fn().mockRejectedValue(new Error("blocked")),
			delete: vi.fn(),
		};
		await expect(clearDataCaches(failing)).resolves.toBeUndefined();
	});
});
