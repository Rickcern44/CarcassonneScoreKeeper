import { asc, eq } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import { players } from "$lib/server/db/schema";

export interface Player {
	id: string;
	name: string;
	created_at: string;
}

export type CreatePlayerResult =
	| { player: Player; error?: undefined }
	| { player?: undefined; error: string };

/** Persistence operations the player service needs. */
export interface PlayerRepository {
	list(): Promise<Player[]>;
	get(id: string): Promise<Player | undefined>;
	/** Returns undefined when a player with this name already exists. */
	insert(name: string): Promise<Player | undefined>;
}

export function createPlayerService(repository: PlayerRepository) {
	return {
		list: () => repository.list(),
		get: (id: string) => repository.get(id),
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
				.orderBy(asc(players.createdAt));
			return rows.map(toPlayer);
		},
		async get(id) {
			// Non-UUID ids would make Postgres throw rather than match nothing.
			if (!UUID.test(id)) return undefined;
			const [row] = await getDatabase()
				.select()
				.from(players)
				.where(eq(players.id, id));
			return row && toPlayer(row);
		},
		async insert(name) {
			const [row] = await getDatabase()
				.insert(players)
				.values({ name })
				.onConflictDoNothing()
				.returning();
			return row && toPlayer(row);
		},
	};
}

export const playerService = createPlayerService(
	createDrizzlePlayerRepository(),
);
