// What the live game stream sends (server) and what game screens do with it
// (client). A message only says "something changed": viewers reload the game
// through its normal load, so ranking and ties stay computed in one place.
export type GameStatus = "active" | "finished";

export type GameMessage =
	| {
			type: "changed";
			eventCount: number;
			/** Highest score event id, or null; changes on every add, undo and removal. */
			lastEventId: number | null;
			status: GameStatus;
	  }
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
			(value.lastEventId === null || Number.isInteger(value.lastEventId)) &&
			(value.status === "active" || value.status === "finished")
		) {
			return {
				type: "changed",
				eventCount: value.eventCount,
				lastEventId: value.lastEventId,
				status: value.status,
			};
		}
	} catch {}
	return undefined;
}

/** A change this screen already shows (for example its own) needs no reload. */
export function isNewChange(
	message: Extract<GameMessage, { type: "changed" }>,
	shown: {
		eventCount: number;
		lastEventId: number | null;
		status: GameStatus;
	},
): boolean {
	return (
		message.eventCount !== shown.eventCount ||
		message.lastEventId !== shown.lastEventId ||
		message.status !== shown.status
	);
}
