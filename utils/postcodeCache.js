// utils/postcodeCache.js
import { sql } from '@/lib/db';
import redis from '@/lib/redis';
import { getCoordsFromOpenCage } from '@/utils/geocoders';

/**
 * Safely fetch coordinates for a postcode:
 * 1. Check Redis cache
 * 2. If not found, check database
 * 3. If still not found, use OpenCage API and cache+store it
 */
export async function getCoordinatesFromPostcode(postcode) {
  const cleaned = postcode.trim().toUpperCase();

  // 1️⃣ Try Redis
  const cached = await redis.get(cleaned);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2️⃣ Try database
  const dbResult = await sql`
    SELECT lat, lng FROM coordinates WHERE postcode = ${cleaned}
  `;
  if (dbResult.length > 0) {
    const coords = dbResult[0];
    await redis.set(cleaned, JSON.stringify(coords), 'EX', 86400); // cache 1 day
    return coords;
  }

  // 3️⃣ Try OpenCage API
  const coords = await getCoordsFromOpenCage(cleaned);
  if (coords) {
    await sql`
      INSERT INTO coordinates (postcode, lat, lng)
      VALUES (${cleaned}, ${coords.lat}, ${coords.lng})
      ON CONFLICT (postcode) DO NOTHING
    `;
    await redis.set(cleaned, JSON.stringify(coords), 'EX', 86400);
    return coords;
  }

  return null;
}

