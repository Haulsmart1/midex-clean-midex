import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="theme-color" content="#000000" />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
          {/* ✅ Move your TomTom styles here */}
          <link
            rel="stylesheet"
            href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/maps/maps.css"
          />
          <link
            rel="stylesheet"
            href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.18.0/plugins/SearchBox/SearchBox.css"
          />
        </Head>
        <body
          style={{
            backgroundColor: '#0b0b0b',
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            margin: 0,
            padding: 0,
          }}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
