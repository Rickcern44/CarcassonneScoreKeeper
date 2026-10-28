import { gameService } from "#lib/services/gameService.js";
import type { PageServerLoad } from "./$types";

const RECENT_GAMES = 3;

export const load = (async () => {
	const [active, finished] = await Promise.all([
		gameService.getActive(),
		gameService.listFinished(),
	]);
	return { active: active ?? null, recent: finished.slice(0, RECENT_GAMES) };
}) satisfies PageServerLoad;
