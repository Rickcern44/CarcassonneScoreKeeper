/** Pure rules for what the service worker may store, plus helpers shared with the pages. */

export const APP_CACHE_PREFIX = "app-";
export const DATA_CACHE_PREFIX = "data-";

const DATA_SUFFIX = "/__data.json";
const LOGIN_PATH = "/";

// Pages worth reading offline. Keep this list in step with the routes: anything
// not listed (login, new game, settings, ...) always goes to the network.
const OFFLINE_VIEWABLE = [
	/^\/home$/,
	/^\/history$/,
	/^\/players$/,
	/^\/players\/[^/]+$/,
	/^\/game\/[^/]+$/,
];

/** The page a request is for, with SvelteKit's data-request suffix removed. */
export function pagePathname(pathname: string): string {
	const page = pathname.endsWith(DATA_SUFFIX)
		? pathname.slice(0, -DATA_SUFFIX.length)
		: pathname;
	return page === "" ? LOGIN_PATH : page;
}

export function isDataRequest(pathname: string): boolean {
	return pathname.endsWith(DATA_SUFFIX);
}

export function isOfflineViewable(pathname: string): boolean {
	const page = pagePathname(pathname);
	return OFFLINE_VIEWABLE.some((pattern) => pattern.test(page));
}

export function isLoginPath(pathname: string): boolean {
	return pagePathname(pathname) === LOGIN_PATH;
}

/**
 * Whether a network response may be kept for offline viewing. A redirect
 * (such as a bounce to the login page) is never stored.
 */
export function isStorable(response: {
	status: number;
	redirected: boolean;
	headers: { get(name: string): string | null };
}): boolean {
	if (response.status !== 200 || response.redirected) return false;
	const cacheControl = response.headers.get("cache-control") ?? "";
	return !/\bno-store\b/i.test(cacheControl);
}

/** Delete every saved-data cache (the app-file caches stay). Never throws. */
export async function clearDataCaches(
	cacheStorage:
		| Pick<CacheStorage, "keys" | "delete">
		| undefined = globalThis.caches,
): Promise<void> {
	try {
		if (!cacheStorage) return;
		const names = await cacheStorage.keys();
		await Promise.all(
			names
				.filter((name) => name.startsWith(DATA_CACHE_PREFIX))
				.map((name) => cacheStorage.delete(name)),
		);
	} catch {
		// Cache Storage can be unavailable or blocked; logging out must still work.
	}
}
