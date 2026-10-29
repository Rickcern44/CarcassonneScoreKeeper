import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { identityFor, prefixTitle, resolveAppEnv } from "#lib/appEnv.js";
import {
	SESSION_COOKIE,
	verifySessionToken,
} from "#lib/services/sessionService.js";
import { dev } from "$app/env";
import { APP_ENV, APP_PASSWORD } from "$app/env/private";

const LOGIN_PATH = "/";

const titlePrefix = identityFor(resolveAppEnv(dev, APP_ENV)).titlePrefix;

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.authenticated = verifySessionToken(
		event.cookies.get(SESSION_COOKIE),
		APP_PASSWORD,
	);

	if (!event.locals.authenticated && event.url.pathname !== LOGIN_PATH) {
		throw redirect(303, LOGIN_PATH);
	}

	return resolve(event, {
		// Prefix titles in the first render too, so the tab is labelled before
		// hydration (the root layout keeps it labelled afterwards).
		transformPageChunk: ({ html }) =>
			titlePrefix
				? html.replace(
						/<title>(.*?)<\/title>/g,
						(_, title) => `<title>${prefixTitle(title, titlePrefix)}</title>`,
					)
				: html,
	});
};
