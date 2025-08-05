import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { query } = router;
    if (query.type === 'invite' && query.access_token) {
      // Complete registration, e.g., set password or log user in
      supabase.auth.setSession({
        access_token: query.access_token,
        refresh_token: query.refresh_token,
      }).then(() => {
        // Redirect to dashboard or password set page
        router.push('/dashboard');
      });
    }
  }, [router]);

  return <div>Completing registration...</div>;
}
