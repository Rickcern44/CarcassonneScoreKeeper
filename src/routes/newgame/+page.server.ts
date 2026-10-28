import { playerStore } from "$lib/services/playerService";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return { players: playerStore.list() };
}) satisfies PageServerLoad;
