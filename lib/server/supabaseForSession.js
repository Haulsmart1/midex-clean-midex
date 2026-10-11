import { createClient } from '@supabase/supabase-js';
import { sessionIsCurrent } from './sessionPolicy.cjs';

export function supabaseForSession(session) {
  if (!sessionIsCurrent(session)) throw new Error('Current authenticated session required');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${session.user.supabaseAccessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
