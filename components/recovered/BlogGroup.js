import Head from 'next/head';

export default function BlogGroup({ number, routes }) {
  return <><Head><title>{`Route Group ${number} – Express Sameday Pallet Delivery`}</title><meta name="description" content="Grouped SEO content for pallet delivery routes." /><link rel="canonical" href={`https://www.midnight-xpress.com/blog/routes/group-${number}`} /></Head><main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}><h1>Express Pallet Delivery Routes – Group {number}</h1>{routes.map((route, index) => <article key={`${route.slug}-${index}`}><h2>{route.title}</h2><p>{route.summary}</p></article>)}</main></>;
}
