import { resolveAppEnv } from "#lib/appEnv.js";
import { dev } from "$app/env";
import { APP_ENV } from "$app/env/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => ({
	appEnv: resolveAppEnv(dev, APP_ENV),
});
