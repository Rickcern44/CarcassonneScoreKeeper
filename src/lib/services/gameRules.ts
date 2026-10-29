/** Player limits for a game; shared by the service and the new-game screen. */
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

/** Orders by score (highest first), then name, and assigns tied ranks. */
export function rankPlayers<T extends { name: string; score: number }>(
	players: T[],
): (T & { rank: number })[] {
	const sorted = [...players].sort(
		(a, b) => b.score - a.score || a.name.localeCompare(b.name),
	);
	return sorted.map((player) => ({
		...player,
		rank: sorted.findIndex((other) => other.score === player.score) + 1,
	}));
}
