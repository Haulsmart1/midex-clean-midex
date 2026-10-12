import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

// Recovered dashboards use the canonical NextAuth access token, without a second
// persistent login or refresh-token rotation in the browser.
export default function useReleaseSupabase() {
  const { data: session } = useSession();
  const accessToken = session?.user?.supabaseAccessToken;
  return useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${accessToken || 'unauthenticated-release-session'}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }
  ), [accessToken]);
}
