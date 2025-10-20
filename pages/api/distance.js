import { getTomTomRoute } from '@/utils/getTomTomRoute';
import getTomTomCoords from '@/utils/getTomTomCoords';

/**
 * Haversine formula to calculate straight-line distance in miles
 */
function haversineMiles([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // km
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 0.621371; // miles
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing required "from" or "to" postcode.' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing TOMTOM API key.' });
    }

    // 1️⃣ Convert postcodes to coords
    const fromCoords = await getTomTomCoords(from, apiKey);
    const toCoords = await getTomTomCoords(to, apiKey);

    if (!fromCoords || !toCoords) {
      return res.status(400).json({ error: 'Could not resolve coordinates for given postcodes.' });
    }

    let distanceMiles = 0;
    let polyline = [];

    try {
      // 2️⃣ Primary route via TomTom
      const { distanceMiles: routeMiles, polyline: routeLine } = await getTomTomRoute(fromCoords, toCoords);
      distanceMiles = routeMiles;
      polyline = routeLine;
    } catch (err) {
      console.warn('⚠️ TomTom routing failed. Falling back to haversine:', err.message);

      distanceMiles = haversineMiles(
        [fromCoords.lat, fromCoords.lon],
        [toCoords.lat, toCoords.lon]
      );
      polyline = [
        [fromCoords.lat, fromCoords.lon],
        [toCoords.lat, toCoords.lon],
      ];
    }

    return res.status(200).json({ distanceMiles, polyline });

  } catch (err) {
    console.error('🔥 /api/distance crash:', err.stack || err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
