import { error as svelteError } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({locals: {supabase}}) => {
    const {data : players , error} = await supabase.from("Players").select('*')

    if(error) throw svelteError(404)

    return {players}
}) satisfies PageServerLoad

export const actions ={
  create: async ({ request, locals: {supabase}}) => {
    const formData = await request.formData();

    // Check no players have that name already
    const {count} = await supabase.from('Players')
      .select('*', {count: 'exact', head: true})
      .eq('name', formData.get('name'))

    if (count === 0){
      const {data, error} = await supabase.from('Players').insert({name: formData.get('name')})
      return {data, error}
    }

  }
} satisfies Actions
