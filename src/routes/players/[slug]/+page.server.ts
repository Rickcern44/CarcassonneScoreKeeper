import { database } from "$lib/db";
import { error as svelteError } from "@sveltejs/kit";

export async function load({params}){
  const {data : player , error} = await database.from("Players")
    .select('*')
    .eq('id', params.slug)
    .single()

  if(error) throw svelteError(404)

  return {player}
}
