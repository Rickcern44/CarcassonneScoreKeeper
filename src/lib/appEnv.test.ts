import { describe, expect, it } from "vitest";
import { identityFor, prefixTitle, resolveAppEnv } from "./appEnv";

describe("resolveAppEnv", () => {
	it.each([undefined, "", "staging", "production", "development", "bogus"])(
		"is development under the dev server regardless of APP_ENV (%s)",
		(raw) => {
			expect(resolveAppEnv(true, raw)).toBe("development");
		},
	);

	it("recognises staging and development outside the dev server", () => {
		expect(resolveAppEnv(false, "staging")).toBe("staging");
		expect(resolveAppEnv(false, "development")).toBe("development");
		expect(resolveAppEnv(false, " Staging ")).toBe("staging");
	});

	it.each([undefined, "", "production", "prod", "stage", "stagingg"])(
		"falls back to production for %s",
		(raw) => {
			expect(resolveAppEnv(false, raw)).toBe("production");
		},
	);
});

describe("identityFor", () => {
	it("leaves production unchanged: no banner, no prefix, original manifest", () => {
		const production = identityFor("production");
		expect(production.banner).toBe("");
		expect(production.titlePrefix).toBe("");
		expect(production.manifest).toBe("manifest.webmanifest");
		expect(production.themeColor.light).toBe("#f5f0e4");
	});

	it("gives staging its own manifest, icons and colour", () => {
		const staging = identityFor("staging");
		expect(staging.manifest).toBe("manifest.staging.webmanifest");
		expect(staging.appleTouchIcon).toContain("staging");
		expect(staging.themeColor.light).toBe("#f97316");
		expect(staging.banner).toMatch(/^STAGING/);
	});

	it("labels local runs without changing the installed identity", () => {
		const local = identityFor("development");
		expect(local.banner).toMatch(/^LOCAL/);
		expect(local.manifest).toBe(identityFor("production").manifest);
	});
});

describe("prefixTitle", () => {
	it("adds the prefix once", () => {
		expect(prefixTitle("Home", "[Staging] ")).toBe("[Staging] Home");
		expect(prefixTitle("[Staging] Home", "[Staging] ")).toBe("[Staging] Home");
	});

	it("does nothing without a prefix", () => {
		expect(prefixTitle("Home", "")).toBe("Home");
	});
});
