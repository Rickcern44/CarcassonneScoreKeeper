import { error } from "@sveltejs/kit";
import { playerService } from "$lib/services/playerService";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
	const player = await playerService.get(params.slug);

	if (!player) throw error(404, "Player not found");

	return player;
}) satisfies PageServerLoad;
