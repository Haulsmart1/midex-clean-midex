import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="theme-color" content="#000000" />
          <meta
            name="description"
            content="Midnight Express Freight — express pallet booking & logistics across Europe."
          />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
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
