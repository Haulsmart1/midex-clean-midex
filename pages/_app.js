import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SessionProvider, useSession } from 'next-auth/react';
import 'animate.css';
import Script from 'next/script';
import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

function SupabaseSessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.supabaseAccessToken &&
      session?.user?.supabaseRefreshToken
    ) {
      // Only create client inside effect!
      const supabase = getSupabaseClient(session.user.supabaseAccessToken);
      if (supabase?.auth?.setSession) {
        supabase.auth.setSession({
          access_token: session.user.supabaseAccessToken,
          refresh_token: session.user.supabaseRefreshToken,
        });
      }
    } else if (status === 'unauthenticated') {
      const supabase = getSupabaseClient();
      if (supabase?.auth?.signOut) {
        supabase.auth.signOut();
      }
    }
  }, [session, status]);

  return null;
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SessionProvider session={session}>
      <SupabaseSessionSync />
      <Script
        src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/maps/maps-web.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/services/services-web.min.js"
        strategy="beforeInteractive"
      />
      <link
        rel="stylesheet"
        href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/maps/maps.css"
      />
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}









