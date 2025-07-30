import { sql } from '@/lib/db';

export async function getOrFetchCoords(postcode) {
  const clean = postcode?.toUpperCase().replace(/\s/g, '');
  if (!clean) return null;

  // 1. Check cache
  const cached = await sql`SELECT lat, lng FROM postcodes WHERE postcode = ${clean}`;
  if (cached.length) return cached[0];

  // 2. Fetch from OpenCage
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${clean}+UK&key=${apiKey}`);
  const data = await res.json();
  const coords = data?.results?.[0]?.geometry;
  if (!coords) return null;

  // 3. Save to DB
  await sql`
    INSERT INTO postcodes (postcode, lat, lng)
    VALUES (${clean}, ${coords.lat}, ${coords.lng})
    ON CONFLICT (postcode) DO NOTHING
  `;
  return coords;
}
