import { cities } from '@/lib/cities';
import { internalRegions } from '@/lib/internalRegions';
import { settings } from '@/lib/settings';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const canonical = settings.canonicalUrl || 'https://www.midnight-xpress.com';
  const frequency = settings.sitemapFrequency || 'weekly';
  const today = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];

  // 👉 Fetch dynamic routes
  const { data: dynamicRoutes } = await supabase
    .from('routes')
    .select('origin, destination')
    .eq('status', 'active');

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/register',
    '/login',
    '/routes'
  ];

  const staticUrls = staticPages.map((page, idx) => {
    const modified = new Date(today);
    modified.setDate(today.getDate() - idx);
    return `
      <url>
        <loc>${canonical}${page}</loc>
        <lastmod>${formatDate(modified)}</lastmod>
        <changefreq>${frequency}</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  }).join('');

  const cityUrls = cities.map((city, idx) => {
    const modified = new Date(today);
    modified.setDate(today.getDate() - (idx % 5));
    return `
      <url>
        <loc>${canonical}/pallets/${city.slug}</loc>
        <lastmod>${formatDate(modified)}</lastmod>
        <changefreq>${frequency}</changefreq>
        <priority>0.7</priority>
      </url>
    `;
  }).join('');

  const regionUrls = internalRegions.map((region, idx) => {
    const modified = new Date(today);
    modified.setDate(today.getDate() - (idx % 7));
    return `
      <url>
        <loc>${canonical}/internal/${region.slug}</loc>
        <lastmod>${formatDate(modified)}</lastmod>
        <changefreq>${frequency}</changefreq>
        <priority>0.7</priority>
      </url>
    `;
  }).join('');

  const freightRouteUrls = dynamicRoutes.map((route, idx) => {
    const slug = `${route.origin.toLowerCase()}-to-${route.destination.toLowerCase()}`;
    const modified = new Date(today);
    modified.setDate(today.getDate() - (idx % 10)); // Spread them over 10 days
    return `
      <url>
        <loc>${canonical}/freight/${slug}</loc>
        <lastmod>${formatDate(modified)}</lastmod>
        <changefreq>${frequency}</changefreq>
        <priority>0.6</priority>
      </url>
    `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticUrls}
      ${cityUrls}
      ${regionUrls}
      ${freightRouteUrls}
    </urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
}
