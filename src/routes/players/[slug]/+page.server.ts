import type { PageServerLoad } from './$types';

export const load = (async ({params, locals: {supabase}}) => {
  const {data: player} = await supabase.from("Players")
    .select('*')
    .eq('id', params.slug)
    .single()

  return player;
}) satisfies PageServerLoad
