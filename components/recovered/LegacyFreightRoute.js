import Head from 'next/head';
import { useRouter } from 'next/router';

export default function FreightRoutePage({ slug }) {
  const routeTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <>
      <Head>
        <title>{routeTitle} | Midnight Freight</title>
        <meta name="description" content={`Freight route for ${routeTitle}`} />
      </Head>
      <div
        style={{
          minHeight: '100vh',
          backgroundImage: 'url("/midex.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '3rem',
          color: 'white',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '2rem',
            borderRadius: '8px',
          }}
        >
          <h1>{routeTitle}</h1>
          <p>This route provides overnight customs-cleared freight service between the specified points.</p>
          <p>Please ensure all documentation is submitted prior to 12:00 noon cutoff.</p>
        </div>
      </div>
    </>
  );
}
