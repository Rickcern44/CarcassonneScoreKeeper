import { type Handle, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import {
	SESSION_COOKIE,
	verifySessionToken,
} from "$lib/services/sessionService";

const LOGIN_PATH = "/";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.authenticated = verifySessionToken(
		event.cookies.get(SESSION_COOKIE),
		env.APP_PASSWORD,
	);

	if (!event.locals.authenticated && event.url.pathname !== LOGIN_PATH) {
		throw redirect(303, LOGIN_PATH);
	}

	return resolve(event);
};
