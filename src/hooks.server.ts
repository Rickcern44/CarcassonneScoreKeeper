import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import {
	SESSION_COOKIE,
	verifySessionToken,
} from "#lib/services/sessionService.js";
import { APP_PASSWORD } from "$app/env/private";

const LOGIN_PATH = "/";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.authenticated = verifySessionToken(
		event.cookies.get(SESSION_COOKIE),
		APP_PASSWORD,
	);

	if (!event.locals.authenticated && event.url.pathname !== LOGIN_PATH) {
		throw redirect(303, LOGIN_PATH);
	}

	return resolve(event);
};
