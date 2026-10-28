import { error, fail, redirect } from "@sveltejs/kit";
import { gameService } from "$lib/services/gameService";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
	const detail = await gameService.get(params.id);
	if (!detail) throw error(404, "Game not found");
	return { detail };
}) satisfies PageServerLoad;

export const actions = {
	score: async ({ params, request }) => {
		const formData = await request.formData();
		const playerId = formData.get("playerId");
		const points = Number(formData.get("points"));

		const result = await gameService.addScore(
			params.id,
			typeof playerId === "string" ? playerId : "",
			points,
		);
		if (result.error) return fail(400, { error: result.error });
		return { ok: true };
	},
	undo: async ({ params }) => {
		const result = await gameService.undo(params.id);
		if (result.error) return fail(400, { error: result.error });
		return { ok: true };
	},
	finish: async ({ params }) => {
		const result = await gameService.finish(params.id);
		if (result.error) return fail(400, { error: result.error });
		return { ok: true };
	},
	discard: async ({ params }) => {
		const result = await gameService.discard(params.id);
		if (result.error) return fail(400, { error: result.error });
		throw redirect(303, "/home");
	},
	rematch: async ({ params }) => {
		const result = await gameService.rematch(params.id);
		if (!result.game) return fail(400, { error: result.error });
		throw redirect(303, `/game/${result.game.id}`);
	},
} satisfies Actions;
