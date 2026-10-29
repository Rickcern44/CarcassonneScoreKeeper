// What the live game stream sends (server) and what game screens do with it
// (client). A message only says "something changed": viewers reload the game
// through its normal load, so ranking and ties stay computed in one place.
export type GameStatus = "active" | "finished";

export type GameMessage =
	| { type: "changed"; eventCount: number; status: GameStatus }
	| { type: "discarded" }
	| { type: "rematch"; gameId: string };

export function parseGameMessage(raw: string): GameMessage | undefined {
	try {
		const value = JSON.parse(raw);
		if (value?.type === "discarded") return { type: "discarded" };
		if (value?.type === "rematch" && typeof value.gameId === "string") {
			return { type: "rematch", gameId: value.gameId };
		}
		if (
			value?.type === "changed" &&
			Number.isInteger(value.eventCount) &&
			(value.status === "active" || value.status === "finished")
		) {
			return {
				type: "changed",
				eventCount: value.eventCount,
				status: value.status,
			};
		}
	} catch {}
	return undefined;
}

/** A change this screen already shows (for example its own) needs no reload. */
export function isNewChange(
	message: Extract<GameMessage, { type: "changed" }>,
	shown: { eventCount: number; status: GameStatus },
): boolean {
	return (
		message.eventCount !== shown.eventCount || message.status !== shown.status
	);
}
