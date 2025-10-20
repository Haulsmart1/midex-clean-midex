// pages/_app.js

import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

// ✅ Now loading custom fallback CSS
import '@/styles/react-slide-pane-custom.css';


import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SessionProvider session={session}>
      <Head>
        <link
          rel="stylesheet"
          href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/maps/maps.css"
        />
        <link
          rel="stylesheet"
          href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/plugins/SearchBox/SearchBox.css"
        />
      </Head>

      <Script
        src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/maps/maps-web.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/services/services-web.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/plugins/SearchBox/SearchBox-web.js"
        strategy="beforeInteractive"
      />

      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}









