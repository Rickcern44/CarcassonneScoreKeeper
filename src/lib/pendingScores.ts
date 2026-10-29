import { rankPlayers } from "#lib/services/gameRules.js";

export interface PendingScore {
	id: number;
	playerId: string;
	points: number;
	/** The save succeeded; kept until fresh data that includes it has loaded. */
	done: boolean;
}

/**
 * Scores tapped on this device but not yet reflected in the loaded game.
 * The screen shows the server score plus every entry here. An entry leaves in
 * one of two ways: a failed save drops it at once (rollback), and a successful
 * one is dropped only together with a reload that happened after every request
 * finished, so a point is never shown twice or lost between the two.
 */
export function createPendingScores(
	onChange: (entries: readonly PendingScore[]) => void,
) {
	let entries: PendingScore[] = [];
	let nextId = 1;
	const set = (next: PendingScore[]) => {
		entries = next;
		onChange(entries);
	};

	return {
		add(playerId: string, points: number): number {
			const id = nextId++;
			set([...entries, { id, playerId, points, done: false }]);
			return id;
		},
		/** The request ended. A failure rolls the entry back. */
		finish(id: number, ok: boolean) {
			set(
				ok
					? entries.map((e) => (e.id === id ? { ...e, done: true } : e))
					: entries.filter((e) => e.id !== id),
			);
		},
		/** True while any request is still running. */
		get inFlight() {
			return entries.some((e) => !e.done);
		},
		/** True while anything is unconfirmed: running or awaiting a reload. */
		get active() {
			return entries.length > 0;
		},
		/** Saved entries a reload can now confirm: none while requests run. */
		settled(): number[] {
			if (entries.some((e) => !e.done)) return [];
			return entries.map((e) => e.id);
		},
		drop(ids: number[]) {
			set(entries.filter((e) => !ids.includes(e.id)));
		},
	};
}

interface Scored {
	playerId: string;
	name: string;
	score: number;
}

/** The game as it should look: server scores plus unconfirmed taps, re-ranked. */
export function withPending<
	T extends { players: (Scored & { rank: number })[] },
>(detail: T, entries: readonly PendingScore[]): T {
	if (entries.length === 0) return detail;
	const players = detail.players.map((player) => ({
		...player,
		score:
			player.score +
			entries
				.filter((e) => e.playerId === player.playerId)
				.reduce((sum, e) => sum + e.points, 0),
	}));
	return { ...detail, players: rankPlayers(players) };
}
