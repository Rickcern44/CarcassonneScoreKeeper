import type { PageServerLoad } from "./$types";

export const load = (async ({locals: {supabase}}) => {
  const {data : players , error} = await supabase.from("Players").select('*')

  return {players, error}

}) satisfies PageServerLoad
