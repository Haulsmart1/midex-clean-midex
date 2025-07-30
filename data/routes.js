// pages/freight/[slug].js
import Head from 'next/head';
import Image from 'next/image';
import CountdownClock from '../../components/CountdownClock';
import styles from '../../styles/Dashboard.module.css';

const ROUTES = [
  {
    slug: 'liverpool-to-dublin',
    from: 'Liverpool',
    to: 'Dublin',
    description: 'Direct overnight ferry with customs clearance and ADR support',
  },
  {
    slug: 'cairnryan-to-larne',
    from: 'Cairnryan',
    to: 'Larne',
    description: 'Runs Daily Monday to Friday from 2nd June 2025, customs available',
  },
  {
    slug: 'dover-to-calais',
    from: 'Dover',
    to: 'Calais',
    description: 'High-frequency route for urgent freight deliveries',
  },
  {
    slug: 'felixstowe-to-zeebrugge',
    from: 'Felixstowe',
    to: 'Zeebrugge',
    description: 'Reliable overnight crossings for bulk freight',
  },
  {
    slug: 'heysham-to-belfast',
    from: 'Heysham',
    to: 'Belfast',
    description: 'Twice daily sailings including weekend options',
  },
  {
    slug: 'heysham-to-dublin',
    from: 'Heysham',
    to: 'Dublin',
    description: 'Evening sailings with fast-track customs and boarding',
  },
  {
    slug: 'heysham-to-warrenpoint',
    from: 'Heysham',
    to: 'Warrenpoint',
    description: 'ADR supported route with customs clearance available',
  },
  {
    slug: 'immingham-to-esbjerg',
    from: 'Immingham',
    to: 'Esbjerg',
    description: 'Weekly crossings for commercial and industrial cargo',
  },
  {
    slug: 'immingham-to-hook-of-holland',
    from: 'Immingham',
    to: 'Hook of Holland',
    description: 'Direct ferry access for European distribution',
  },
  {
    slug: 'rosslare-to-bilbao',
    from: 'Rosslare',
    to: 'Bilbao',
    description: 'ADR ready with customs, ideal for southern Europe delivery',
  },
  {
    slug: 'rosslare-to-cherbourg',
    from: 'Rosslare',
    to: 'Cherbourg',
    description: 'Fast freight link with French mainland ports',
  },
];

export async function getStaticPaths() {
  const paths = ROUTES.map((route) => ({
    params: { slug: route.slug },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const route = ROUTES.find((r) => r.slug === params.slug);
  return {
    props: { route },
  };
}

export default function RoutePage({ route }) {
  return (
    <>
      <Head>
        <title>{`${route.from} to ${route.to} Freight Route`}</title>
        <meta name="description" content={`Freight route from ${route.from} to ${route.to}`} />
      </Head>

      <main className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>{`${route.from} to ${route.to}`}</h1>

        <div className={styles.countdownContainer}>
          <CountdownClock targetDate="2025-04-15T09:00:00Z" />
        </div>

        <div className={styles.routeImage}>
          <Image
            src={`/midex7.jpg`}
            alt={`${route.from} to ${route.to} Route`}
            width={800}
            height={400}
          />
        </div>

        <div className={styles.content}>
          <p>{route.description}</p>
          <button
            className={styles.primaryButton}
            onClick={() => (window.location.href = '/booking')}
          >
            Book Now
          </button>
        </div>
      </main>
    </>
  );
}
