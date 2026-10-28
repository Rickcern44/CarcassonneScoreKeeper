import { fail } from "@sveltejs/kit";
import { playerService } from "$lib/services/playerService";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
	return { players: await playerService.list() };
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get("name");

		const result = await playerService.create(
			typeof name === "string" ? name : "",
		);
		if (result.error) return fail(400, { error: result.error });

		return { player: result.player };
	},
} satisfies Actions;
