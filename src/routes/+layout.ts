import { createBrowserClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";
import type { LayoutLoad } from "./$types";

export const load = (async ({ fetch, depends }) => {
	depends("supabase:auth");

	const supabase = createBrowserClient(
		env.PUBLIC_SUPABASE_URL ?? "",
		env.PUBLIC_SUPABASE_KEY ?? "",
		{ global: { fetch } },
	);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	return { supabase, session };
}) satisfies LayoutLoad;
