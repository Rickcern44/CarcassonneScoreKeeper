import type { MeepleColor } from "#lib/meeple.js";
import type { PendingScore } from "#lib/pendingScores.js";

/** One line of the log: saved on the server, or a tap still being saved. */
export interface LogRow {
	key: string;
	/** Set for saved entries; saving ones can't be removed yet. */
	eventId?: number;
	name: string;
	color: MeepleColor;
	points: number;
	runningTotal?: number;
	createdAt?: string;
	saving?: boolean;
}

interface SavedEntry {
	id: number;
	name: string;
	color: MeepleColor;
	points: number;
	runningTotal: number;
	createdAt: string;
}

/** Taps still saving come first (newest first), then the saved entries. */
export function buildLogRows(
	players: { playerId: string; name: string; color: MeepleColor }[],
	pending: readonly PendingScore[],
	saved: readonly SavedEntry[],
): LogRow[] {
	const saving = [...pending].reverse().flatMap((entry): LogRow[] => {
		const player = players.find((p) => p.playerId === entry.playerId);
		return player
			? [
					{
						key: `saving-${entry.id}`,
						name: player.name,
						color: player.color,
						points: entry.points,
						saving: true,
					},
				]
			: [];
	});
	return [
		...saving,
		...saved.map(
			(entry): LogRow => ({
				key: `entry-${entry.id}`,
				eventId: entry.id,
				name: entry.name,
				color: entry.color,
				points: entry.points,
				runningTotal: entry.runningTotal,
				createdAt: entry.createdAt,
			}),
		),
	];
}
