import { fail, redirect } from "@sveltejs/kit";
import { gameService, MEEPLE_COLORS } from "$lib/services/gameService";
import { playerService } from "$lib/services/playerService";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
	const [players, active] = await Promise.all([
		playerService.list(),
		gameService.getActive(),
	]);
	return {
		players: players.map(({ id, name }) => ({ id, name })),
		activeGameId: active?.game.id ?? null,
	};
}) satisfies PageServerLoad;

export const actions = {
	// Each `player` field is "<playerId>:<color>".
	start: async ({ request }) => {
		const formData = await request.formData();
		const entries = formData.getAll("player").flatMap((value) => {
			if (typeof value !== "string") return [];
			const [playerId, color] = value.split(":");
			const known = MEEPLE_COLORS.find((c) => c === color);
			return playerId && known ? [{ playerId, color: known }] : [];
		});

		const result = await gameService.create(entries);
		if (!result.game) return fail(400, { error: result.error });

		throw redirect(303, `/game/${result.game.id}`);
	},
} satisfies Actions;
