import { database } from "$lib/db";
import { error as svelteError } from "@sveltejs/kit";
import type { Actions } from './$types';

export async function load(){
  const {data : players , error} = await database.from("Players").select('*')

  if(error) throw svelteError(404)

  return {players}
}

export const actions ={
  create: async ({ request}) => {
    const data = await request.formData();

    // Check no players have that name already
    const {count} = await database.from('Players')
      .select('*', {count: 'exact', head: true})
      .eq('name', data.get('name'))

    if(data && count == 0){
      await database.from('Players').insert({name: data.get('name')})
    }else{
      // TODO: Add a toast message here instead of a throw
      throw svelteError(403, 'that name already exists please choose another!');
    }
  }
} satisfies Actions
