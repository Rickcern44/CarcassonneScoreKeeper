import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_KEY } from '$env/static/public';

export const database = createClient("https://hvpxjnmktqdukbvgvcst.supabase.co",
  PUBLIC_SUPABASE_KEY)

export const createGame = async () => {
  database.from('Game')
}
