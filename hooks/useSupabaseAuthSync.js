import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseAuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.supabaseAccessToken) {
      supabase.auth.setSession({
        access_token: session.user.supabaseAccessToken,
        refresh_token: session.user.supabaseRefreshToken,
      });
    } else if (status === 'unauthenticated') {
      supabase.auth.signOut();
    }
  }, [session, status]);
}
