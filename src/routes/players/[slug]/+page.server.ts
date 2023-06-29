import { database } from "$lib/db";
import { error as svelteError } from "@sveltejs/kit";
import type { PageServerLoad } from './$types';

export const load = (async ({params}) => {
  const {data: player, error} = await database.from("Players")
    .select('*')
    .eq('id', params.slug)
    .single()

  return player;
}) satisfies PageServerLoad
