import Head from 'next/head';
import Link from 'next/link';
import { blogPosts } from '@/lib/productionBlog';

export function getServerSideProps({ params, res }) {
  const post = blogPosts.find(item => item.slug === params.slug);
  if (!post) return { notFound: true };
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
  return { props: { post } };
}

export default function BlogPost({ post }) {
  const canonical = `https://www.midnight-xpress.com/blog/${post.slug}`;
  return <><Head><title>{post.title} – Express Pallet Courier Delivery</title><meta name="description" content={post.summary} /><meta property="og:title" content={post.title} /><meta property="og:description" content={post.summary} /><meta property="og:type" content="article" /><meta property="og:url" content={canonical} /><link rel="canonical" href={canonical} /></Head><main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}><h1>{post.title}</h1><p><em>{post.date}</em></p><p>{post.summary}</p><Link href="/">← Back to Home</Link></main></>;
}
