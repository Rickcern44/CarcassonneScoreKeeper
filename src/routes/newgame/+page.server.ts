import type { PageServerLoad } from './$types';
import { database } from "$lib/db";
import { error as svelteError } from "@sveltejs/kit";

export async function load(){
  const {data : players , error} = await database.from("Players").select('*')

  if(error) throw svelteError(404)

  return {players}
}
