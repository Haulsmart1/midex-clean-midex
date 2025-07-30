import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Export a global singleton client for universal use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Keep your utility if you need per-request clients
export function getSupabaseClient(access_token = null) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    access_token
      ? { global: { headers: { Authorization: `Bearer ${access_token}` } } }
      : {}
  );
}
