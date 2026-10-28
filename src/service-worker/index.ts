import {
	APP_CACHE_PREFIX,
	clearDataCaches,
	DATA_CACHE_PREFIX,
	isDataRequest,
	isLoginPath,
	isOfflineViewable,
	isStorable,
} from "#lib/offline.js";
import { version } from "$app/env";
import { assets, immutable } from "$app/manifest";
import { asset } from "$app/paths";
import { self } from "$app/service-worker";

const APP_CACHE = `${APP_CACHE_PREFIX}${version}`;
const DATA_CACHE = `${DATA_CACHE_PREFIX}${version}`;
const OFFLINE_PAGE = asset("offline.html");

// Build output and everything in static/, resolved to the pathnames requests use.
const PRECACHE = [
	...immutable.map((file) => asset(file.path as Parameters<typeof asset>[0])),
	...assets.map((file) => asset(file.path)),
];
const PRECACHED = new Set<string>(PRECACHE);

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE)),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			// Stored pages can be incompatible with new JS, so only this version's caches stay.
			const keep = new Set([APP_CACHE, DATA_CACHE]);
			for (const name of await caches.keys()) {
				if (!keep.has(name)) await caches.delete(name);
			}
		})(),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	// Form actions, login and logout always go to the network.
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	if (PRECACHED.has(url.pathname)) {
		event.respondWith(cacheFirst(request, url.pathname));
		return;
	}

	if (request.mode === "navigate" || isDataRequest(url.pathname)) {
		event.respondWith(networkFirst(request, url));
	}
});

async function cacheFirst(request: Request, pathname: string) {
	const cache = await caches.open(APP_CACHE);
	return (await cache.match(pathname)) ?? fetch(request);
}

async function networkFirst(request: Request, url: URL) {
	try {
		const response = await fetch(request);

		if (isOfflineViewable(url.pathname) && isStorable(response)) {
			const cache = await caches.open(DATA_CACHE);
			await cache.put(request, response.clone());
		} else if (
			response.redirected &&
			isLoginPath(new URL(response.url).pathname)
		) {
			// The session ended: don't keep showing the previous user's data.
			await clearDataCaches(caches);
		}
		return response;
	} catch (error) {
		if (isOfflineViewable(url.pathname)) {
			const cache = await caches.open(DATA_CACHE);
			const saved =
				(await cache.match(request)) ??
				(await cache.match(request, { ignoreSearch: true }));
			if (saved) return saved;
		}
		if (request.mode === "navigate") {
			const offline = await (await caches.open(APP_CACHE)).match(OFFLINE_PAGE);
			if (offline) return offline;
		}
		throw error;
	}
}
