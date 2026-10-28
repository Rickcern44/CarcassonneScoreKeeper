import { error } from "@sveltejs/kit";
import { playerStore } from "$lib/services/playerService";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
	const player = playerStore.get(params.slug);

	if (!player) throw error(404, "Player not found");

	return player;
}) satisfies PageServerLoad;
