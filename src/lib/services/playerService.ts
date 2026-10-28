import { randomUUID } from "node:crypto";

export interface Player {
	id: string;
	name: string;
	created_at: string;
}

export type CreatePlayerResult =
	| { player: Player; error?: undefined }
	| { player?: undefined; error: string };

/**
 * Temporary in-memory player store. Data is lost when the server restarts;
 * it stands in until a persistent database replaces it.
 */
export function createPlayerStore() {
	const players: Player[] = [];

	return {
		list(): Player[] {
			return [...players];
		},
		get(id: string): Player | undefined {
			return players.find((player) => player.id === id);
		},
		create(rawName: string): CreatePlayerResult {
			const name = rawName.trim();
			if (!name) return { error: "Player name is required." };
			if (players.some((player) => player.name === name)) {
				return { error: `A player named "${name}" already exists.` };
			}

			const player: Player = {
				id: randomUUID(),
				name,
				created_at: new Date().toISOString(),
			};
			players.push(player);
			return { player };
		},
	};
}

export const playerStore = createPlayerStore();
