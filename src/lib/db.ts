import { createClient } from "@supabase/supabase-js";
import { PUBLIC_VITE_SUPABASE_API_KEY } from '$env/static/public';

export const database = createClient("https://hvpxjnmktqdukbvgvcst.supabase.co",
  PUBLIC_VITE_SUPABASE_API_KEY)
