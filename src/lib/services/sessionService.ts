import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Session tokens are `<issuedAt>.<signature>`, signed with the shared password.
 * Rotating the password changes the signing key, so every existing token stops verifying.
 */
function sign(issuedAt: string, password: string): string {
	return createHmac("sha256", password)
		.update(`session:${issuedAt}`)
		.digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
	// Hash first so comparison time does not depend on input length
	const hashA = createHash("sha256").update(a).digest();
	const hashB = createHash("sha256").update(b).digest();
	return timingSafeEqual(hashA, hashB);
}

export function passwordMatches(
	candidate: string,
	password: string | undefined,
): boolean {
	if (!password) return false;
	return safeEqual(candidate, password);
}

export function createSessionToken(
	password: string,
	now: number = Date.now(),
): string {
	const issuedAt = Math.floor(now / 1000).toString();
	return `${issuedAt}.${sign(issuedAt, password)}`;
}

export function verifySessionToken(
	token: string | undefined,
	password: string | undefined,
	now: number = Date.now(),
): boolean {
	if (!token || !password) return false;

	const [issuedAt, signature, ...rest] = token.split(".");
	if (!issuedAt || !signature || rest.length > 0) return false;
	if (!/^\d+$/.test(issuedAt)) return false;

	const ageSeconds = Math.floor(now / 1000) - Number(issuedAt);
	if (ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE_SECONDS) return false;

	return safeEqual(signature, sign(issuedAt, password));
}
