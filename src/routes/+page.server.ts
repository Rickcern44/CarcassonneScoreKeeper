import { fail, redirect } from "@sveltejs/kit";
import {
	createSessionToken,
	passwordMatches,
	SESSION_COOKIE,
	SESSION_MAX_AGE_SECONDS,
} from "#lib/services/sessionService.js";
import { APP_PASSWORD } from "$app/env/private";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals: { authenticated } }) => {
	// if the user is already logged in return them to the home page
	if (authenticated) {
		throw redirect(303, "/home");
	}
}) satisfies PageServerLoad;

export const actions = {
	login: async ({ request, cookies }) => {
		const appPassword = APP_PASSWORD;
		if (!appPassword) {
			return fail(500, {
				error: "Login is not configured. Set APP_PASSWORD on the server.",
			});
		}

		const formData = await request.formData();
		const password = formData.get("password");

		if (
			typeof password !== "string" ||
			!passwordMatches(password, appPassword)
		) {
			return fail(401, { error: "Incorrect password." });
		}

		cookies.set(SESSION_COOKIE, createSessionToken(appPassword), {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			maxAge: SESSION_MAX_AGE_SECONDS,
		});

		throw redirect(303, "/home");
	},
	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: "/" });
		throw redirect(303, "/");
	},
} satisfies Actions;
