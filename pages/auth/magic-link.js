import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';

export default function MagicLinkCallback() {
  const router = useRouter();
  const handled = useRef(false);
  const [message, setMessage] = useState('Completing secure sign-in…');

  useEffect(() => {
    let active = true;

    const finish = async (session) => {
      if (!active || handled.current || !session?.access_token || !session?.refresh_token) return;
      handled.current = true;

      const result = await signIn('supabase-session', {
        redirect: false,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      });

      if (!active) return;
      if (result?.error) {
        setMessage('This account is not authorised for Midnight Express.');
        return;
      }
      router.replace('/auth/redirect');
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage('The sign-in link is invalid or has expired.');
      else finish(data?.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => finish(session));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07111f', color: '#fff', padding: 24 }}>
      <div role="status" aria-live="polite" style={{ maxWidth: 460, textAlign: 'center', fontSize: 20 }}>
        {message}
      </div>
    </main>
  );
}
