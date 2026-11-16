import Head from 'next/head';
import { europeanRoutes, productionRouteGroup, routeGroupSize } from '@/lib/productionBlog';

export function getServerSideProps({ params, res }) {
  const match = /^group-([1-9]\d*)$/.exec(params.group);
  const groupNumber = match ? Number(match[1]) : 0;
  if (!groupNumber || groupNumber > Math.ceil(europeanRoutes.length / routeGroupSize)) return { notFound: true };
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
  return { props: { routes: productionRouteGroup(groupNumber), groupNumber } };
}

export default function EuropeanGroup({ routes, groupNumber }) {
  return <><Head><title>{`Group ${groupNumber} – European Pallet Delivery Routes`}</title><meta name="description" content="European pallet delivery, ADR freight and same-day services." /><link rel="canonical" href={`https://www.midnight-xpress.com/blog/routes/group-${groupNumber}`} /></Head><main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}><h1>Group {groupNumber} – Express Pallet Routes</h1>{routes.map((route, index) => <article key={`${route.slug}-${index}`}><h2>{route.title}</h2><p>{route.summary}</p></article>)}</main></>;
}
