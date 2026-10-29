import type { GameMessage } from "#lib/gameMessages.js";

type Listener = (message: GameMessage) => void;

/**
 * In-process publish/subscribe per game. The app runs on a single Fly machine,
 * so one process sees every change. With a second machine, viewers would be
 * split across processes and miss changes made on the other one: replace this
 * with Postgres LISTEN/NOTIFY (on a direct, non-pooled connection) or a hosted
 * pub/sub.
 */
export function createGameEvents() {
	const listeners = new Map<string, Set<Listener>>();

	return {
		/** Returns a function that unsubscribes. */
		subscribe(gameId: string, listener: Listener): () => void {
			let set = listeners.get(gameId);
			if (!set) {
				set = new Set();
				listeners.set(gameId, set);
			}
			set.add(listener);
			return () => {
				const current = listeners.get(gameId);
				current?.delete(listener);
				if (current?.size === 0) listeners.delete(gameId);
			};
		},

		/** A failing listener never stops the others or the caller. */
		publish(gameId: string, message: GameMessage): void {
			for (const listener of [...(listeners.get(gameId) ?? [])]) {
				try {
					listener(message);
				} catch {}
			}
		},

		/** Open subscriptions, for one game or all; lets tests catch leaks. */
		subscriberCount(gameId?: string): number {
			if (gameId) return listeners.get(gameId)?.size ?? 0;
			let total = 0;
			for (const set of listeners.values()) total += set.size;
			return total;
		},
	};
}

export type GameEvents = ReturnType<typeof createGameEvents>;

export const gameEvents = createGameEvents();
