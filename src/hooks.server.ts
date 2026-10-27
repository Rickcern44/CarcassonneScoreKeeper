import { env } from "$env/dynamic/public";
import { createServerClient } from "@supabase/ssr";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(
		env.PUBLIC_SUPABASE_URL ?? "",
		env.PUBLIC_SUPABASE_KEY ?? "",
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookies) => {
					cookies.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, options);
					});
				},
			},
		},
	);
	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	return resolve(event, {
		/**
		 * There´s an issue with `filterSerializedResponseHeaders` not working when using `sequence`
		 *
		 * https://github.com/sveltejs/kit/issues/8061
		 */
		filterSerializedResponseHeaders(name) {
			return name === "content-range";
		},
	});
};
