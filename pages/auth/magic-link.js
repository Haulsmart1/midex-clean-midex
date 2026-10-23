import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';

export default function MagicLinkCallback() {
  const router = useRouter();
  const handled = useRef(false);
  const completed = useRef(false);
  const [message, setMessage] = useState('Completing secure sign-in…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const queryValue = (value) => (Array.isArray(value) ? value[0] : value);
    const callbackError = queryValue(router.query.error);
    const callbackErrorCode = queryValue(router.query.error_code);
    const callbackErrorDescription = queryValue(router.query.error_description);
    const expiredLink =
      callbackErrorCode === 'otp_expired' ||
      /one-time token not found|invalid or has expired/i.test(callbackErrorDescription || '');

    // Supabase redirects verification failures back to this page in the query
    // string. Handle them immediately instead of leaving customers on a timer.
    if (callbackError || callbackErrorCode) {
      setMessage(
        expiredLink
          ? 'This sign-in link has already been used or has expired. Go to login and request a fresh link. Use the newest email and open it in the same browser where you requested it.'
          : 'We could not verify this sign-in link. Go to login and request a fresh link. If the problem continues, contact freight operations.'
      );
      setFailed(true);
      return;
    }

    let active = true;
    let timeout;

    const fail = (text) => {
      if (!active || completed.current) return;
      clearTimeout(timeout);
      setMessage(text);
      setFailed(true);
    };

    // The callback must never leave a customer on an indefinite spinner.
    timeout = setTimeout(() => {
      if (!completed.current) {
        fail('No verified sign-in session arrived. Go to login and request a fresh link, then open it in the same browser. Contact freight operations if the problem continues.');
      }
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
          fail('Your email link was verified, but the website rejected the session exchange. Contact freight operations for help.');
          return;
        }

        // Verify NextAuth persisted a session before leaving the callback.
        let websiteSession = null;
        for (let attempt = 0; attempt < 3 && active; attempt += 1) {
          websiteSession = await getSession();
          if (websiteSession?.user?.id) break;
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
        if (!websiteSession?.user?.id) {
          fail('Your email was verified, but this browser did not retain the website session. Go to login and try again in the same browser. Contact freight operations if the problem continues.');
          return;
        }

        completed.current = true;
        clearTimeout(timeout);
        router.replace('/auth/redirect');
      } catch {
        fail('Website sign-in could not be completed. Go to login and try again, or contact freight operations.');
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) fail('The sign-in link could not be verified. Go to login and request a fresh link.');
      else finish(data?.session);
    }).catch(() => {
      fail('Could not check the sign-in session. Go to login and request a fresh link.');
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') finish(session);
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      data.subscription.unsubscribe();
    };
  }, [router, router.isReady, router.query]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07111f', color: '#fff', padding: 24 }}>
      <div role={failed ? 'alert' : 'status'} aria-live={failed ? 'assertive' : 'polite'} style={{ maxWidth: 460, textAlign: 'center', fontSize: 20 }}>
        <p>{message}</p>
        {failed && (
          <div style={{ display: 'grid', gap: 14, justifyItems: 'center', fontSize: 16 }}>
            <Link href="/login" style={{ color: '#07111f', background: '#c6eaff', borderRadius: 8, padding: '12px 20px', fontWeight: 700, textDecoration: 'none' }}>
              Return to login
            </Link>
            <Link href="/contact" style={{ color: '#c6eaff' }}>
              Contact freight operations
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
