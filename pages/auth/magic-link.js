import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';

export default function MagicLinkCallback() {
  const router = useRouter();
  const handled = useRef(false);
  const completed = useRef(false);
  const [message, setMessage] = useState('Completing secure sign-in…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const fail = (text) => {
      if (!active || completed.current) return;
      clearTimeout(timeout);
      setMessage(text);
      setFailed(true);
    };

    // The callback must never leave a customer on an indefinite spinner.
    const timeout = setTimeout(() => {
      if (!completed.current) fail('No verified sign-in session was received. The link may be expired or this browser may have blocked the callback. Please contact our freight team.');
    }, 12000);

    const finish = async (session) => {
      if (!active || handled.current || !session?.access_token || !session?.refresh_token) return;
      handled.current = true;

      try {
        const result = await signIn('supabase-session', {
          redirect: false,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });

        if (!active) return;
        if (!result || result.error || !result.ok) {
          fail('Your link was received, but Midnight Express could not establish approved website access. Please contact our freight team.');
          return;
        }
        completed.current = true;
        clearTimeout(timeout);
        router.replace('/auth/redirect');
      } catch {
        fail('Website sign-in could not be completed. Please contact our freight team.');
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) fail('The sign-in link is invalid or has expired.');
      else finish(data?.session);
    }).catch(() => fail('Could not check the sign-in session. Please contact our freight team.'));

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') finish(session);
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      data.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07111f', color: '#fff', padding: 24 }}>
      <div role="status" aria-live="polite" style={{ maxWidth: 460, textAlign: 'center', fontSize: 20 }}>
        <p>{message}</p>
        {failed && <p style={{ fontSize: 16 }}><Link href="/contact" style={{ color: '#c6eaff' }}>Contact freight operations</Link></p>}
      </div>
    </main>
  );
}
