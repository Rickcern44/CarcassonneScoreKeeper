import { describe, expect, it } from "vitest";
import {
	createSessionToken,
	passwordMatches,
	SESSION_MAX_AGE_SECONDS,
	verifySessionToken,
} from "./sessionService";

const password = "meeple-farmer";
const now = Date.UTC(2026, 9, 27);

describe("passwordMatches", () => {
	it("accepts the configured password", () => {
		expect(passwordMatches(password, password)).toBe(true);
	});

	it("rejects a wrong password", () => {
		expect(passwordMatches("wrong", password)).toBe(false);
	});

	it("fails closed when no password is configured", () => {
		expect(passwordMatches("", undefined)).toBe(false);
		expect(passwordMatches("", "")).toBe(false);
	});
});

describe("session tokens", () => {
	it("verifies a token signed with the current password", () => {
		const token = createSessionToken(password, now);
		expect(verifySessionToken(token, password, now)).toBe(true);
	});

	it("rejects a tampered token", () => {
		const token = createSessionToken(password, now);
		const [issuedAt, signature] = token.split(".");
		expect(
			verifySessionToken(`${Number(issuedAt) + 1}.${signature}`, password, now),
		).toBe(false);
		expect(verifySessionToken(`${issuedAt}.${signature}x`, password, now)).toBe(
			false,
		);
		expect(verifySessionToken(`${token}.extra`, password, now)).toBe(false);
	});

	it("rejects missing or malformed tokens", () => {
		expect(verifySessionToken(undefined, password, now)).toBe(false);
		expect(verifySessionToken("", password, now)).toBe(false);
		expect(verifySessionToken("not-a-token", password, now)).toBe(false);
	});

	it("rejects tokens after the password is rotated", () => {
		const token = createSessionToken(password, now);
		expect(verifySessionToken(token, "new-password", now)).toBe(false);
	});

	it("rejects tokens when no password is configured", () => {
		const token = createSessionToken(password, now);
		expect(verifySessionToken(token, undefined, now)).toBe(false);
	});

	it("rejects expired tokens", () => {
		const token = createSessionToken(password, now);
		const justValid = now + SESSION_MAX_AGE_SECONDS * 1000;
		expect(verifySessionToken(token, password, justValid)).toBe(true);
		expect(verifySessionToken(token, password, justValid + 1000)).toBe(false);
	});

	it("rejects tokens issued in the future", () => {
		const token = createSessionToken(password, now + 60_000);
		expect(verifySessionToken(token, password, now)).toBe(false);
	});
});
