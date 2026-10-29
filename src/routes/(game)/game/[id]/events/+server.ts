import { error } from "@sveltejs/kit";
import { gameEvents } from "#lib/server/gameEvents.js";
import { gameEventStream } from "#lib/server/gameStream.js";
import { gameService } from "#lib/services/gameService.js";
import type { RequestHandler } from "./$types";

// Live updates for one game as Server-Sent Events. The session check in
// hooks.server.ts protects it like every other route.
export const GET: RequestHandler = async ({ params, request }) => {
	if (!(await gameService.get(params.id))) throw error(404, "Game not found");

	return new Response(gameEventStream(params.id, gameEvents, request.signal), {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-store",
			"X-Accel-Buffering": "no",
		},
	});
};
