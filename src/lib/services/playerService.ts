import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "#lib/server/db/index.js";
import { players } from "#lib/server/db/schema.js";

export interface Player {
	id: string;
	name: string;
	created_at: string;
}

export type RemovePlayerResult = { error?: string };

export type CreatePlayerResult =
	| { player: Player; error?: undefined }
	| { player?: undefined; error: string };

/** Persistence operations the player service needs. */
export interface PlayerRepository {
	list(): Promise<Player[]>;
	get(id: string): Promise<Player | undefined>;
	/**
	 * Returns undefined when an active player with this name already exists.
	 * An archived player with this name is restored instead.
	 */
	insert(name: string): Promise<Player | undefined>;
	/** Archives an active player. Returns false when there is none with this id. */
	archive(id: string): Promise<boolean>;
}

export function createPlayerService(repository: PlayerRepository) {
	return {
		list: () => repository.list(),
		get: (id: string) => repository.get(id),
		/** Removing archives the player so past games keep their results. */
		async remove(id: string): Promise<RemovePlayerResult> {
			const archived = await repository.archive(id);
			return archived ? {} : { error: "Player not found." };
		},
		async create(rawName: string): Promise<CreatePlayerResult> {
			const name = rawName.trim();
			if (!name) return { error: "Player name is required." };

			const player = await repository.insert(name);
			if (!player) return { error: `A player named "${name}" already exists.` };
			return { player };
		},
	};
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toPlayer(row: typeof players.$inferSelect): Player {
	return {
		id: row.id,
		name: row.name,
		created_at: row.createdAt.toISOString(),
	};
}

export function createDrizzlePlayerRepository(
	getDatabase: typeof getDb = getDb,
): PlayerRepository {
	return {
		async list() {
			const rows = await getDatabase()
				.select()
				.from(players)
				.where(isNull(players.archivedAt))
				.orderBy(asc(players.createdAt), asc(players.name));
			return rows.map(toPlayer);
		},
		async get(id) {
			// Non-UUID ids would make Postgres throw rather than match nothing.
			if (!UUID.test(id)) return undefined;
			const [row] = await getDatabase()
				.select()
				.from(players)
				.where(and(eq(players.id, id), isNull(players.archivedAt)));
			return row && toPlayer(row);
		},
		async insert(name) {
			const [row] = await getDatabase()
				.insert(players)
				.values({ name })
				.onConflictDoUpdate({
					target: players.name,
					set: { archivedAt: null },
					// Only restores archived players; active duplicates insert nothing.
					setWhere: isNotNull(players.archivedAt),
				})
				.returning();
			return row && toPlayer(row);
		},
		async archive(id) {
			if (!UUID.test(id)) return false;
			const rows = await getDatabase()
				.update(players)
				.set({ archivedAt: new Date() })
				.where(and(eq(players.id, id), isNull(players.archivedAt)))
				.returning({ id: players.id });
			return rows.length > 0;
		},
	};
}

export const playerService = createPlayerService(
	createDrizzlePlayerRepository(),
);
