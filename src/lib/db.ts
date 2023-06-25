import { createClient } from "@supabase/supabase-js";
import { env } from '$env/dynamic/private';

// TODO: Add Supabase Keys from env file
export const database = createClient("https://hvpxjnmktqdukbvgvcst.supabase.co",
  import.meta.env.VITE_SUPABASE_API_KEY)
