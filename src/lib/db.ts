import { createClient } from "@supabase/supabase-js";
import { env } from '$env/dynamic/private';

export const database = createClient("https://hvpxjnmktqdukbvgvcst.supabase.co",
  env.VITE_SUPABASE_API_KEY)
