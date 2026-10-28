import { gameService } from "#lib/services/gameService.js";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return { games: await gameService.listFinished() };
}) satisfies PageServerLoad;
