import Head from 'next/head';
import Link from 'next/link';
import { europeanRoutes, routeGroupSize } from '@/lib/productionBlog';

export function getStaticProps() {
  return { props: { totalGroups: Math.ceil(europeanRoutes.length / routeGroupSize) } };
}

export default function BlogIndex({ totalGroups }) {
  return <>
    <Head><title>Blog &amp; Pallet Route Index | Midnight Express</title><meta name="description" content="Explore logistics news and grouped pallet delivery routes across Europe. Express freight, ADR, and same-day services." /><link rel="canonical" href="https://www.midnight-xpress.com/blog" /></Head>
    <main style={{ padding: '2rem' }}>
      <h1>📦 Freight Logistics Blog &amp; European Route Index</h1>
      <p>Browse grouped freight delivery routes across Europe.</p>
      {Array.from({ length: totalGroups }, (_, index) => <article key={index}><h3>European Route Group {index + 1}</h3><p>10,000+ freight route pages with pallet, ADR and customs-cleared courier lanes.</p><Link href={`/blog/routes/group-${index + 1}`}>View Group</Link></article>)}
    </main>
  </>;
}
