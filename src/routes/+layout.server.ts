import { database } from '$lib/db';
import { error as svelteError } from '@sveltejs/kit';

export async function load() {
	const { data, error } = await database.auth.getSession();

	if (error) {
		throw svelteError(403, error.message);
	}

	return data;
}
