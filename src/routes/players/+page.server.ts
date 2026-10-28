import { fail } from "@sveltejs/kit";
import { playerStore } from "$lib/services/playerService";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
	return { players: playerStore.list() };
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get("name");

		const result = playerStore.create(typeof name === "string" ? name : "");
		if (result.error) return fail(400, { error: result.error });

		return { player: result.player };
	},
} satisfies Actions;
