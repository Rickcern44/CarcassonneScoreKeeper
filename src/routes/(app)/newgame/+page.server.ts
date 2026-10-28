import { playerService } from "$lib/services/playerService";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return { players: await playerService.list() };
}) satisfies PageServerLoad;
