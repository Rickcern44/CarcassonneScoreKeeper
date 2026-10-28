import { fail } from "@sveltejs/kit";
import { gameService, playerStats } from "$lib/services/gameService";
import { playerService } from "$lib/services/playerService";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
	const [players, finished] = await Promise.all([
		playerService.list(),
		gameService.listFinished(),
	]);
	const stats = playerStats(finished);
	return {
		players: players.map((player) => ({
			...player,
			gamesPlayed: stats.get(player.id)?.gamesPlayed ?? 0,
			wins: stats.get(player.id)?.wins ?? 0,
		})),
	};
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
	remove: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get("id");

		const result = await playerService.remove(typeof id === "string" ? id : "");
		if (result.error) return fail(400, { error: result.error });

		return { removed: true };
	},
} satisfies Actions;
