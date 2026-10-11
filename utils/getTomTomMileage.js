import { throttledRequest } from '@/utils/throttle';

/**
 * Fetch driving distance + polyline between two coordinates using TomTom Routing API.
 * - Inputs are [lat, lon]
 * - Returns distance in meters and a polyline as [[lat,lng], ...]
 *
 * Fallbacks:
 * - If API fails or returns 0 distance, distance = 1609 (approx 1 mi)
 * - Polyline falls back to a simple straight segment [[lat1,lon1],[lat2,lon2]]
 *
 * @param {[number, number]} from [lat, lon]
 * @param {[number, number]} to   [lat, lon]
 * @param {string} apiKey
 * @returns {Promise<{ distance: number, polyline: number[][], raw: any }>}
 */
export async function getTomTomMileage(from, to, apiKey) {
  const validPair = (p) =>
    Array.isArray(p) &&
    p.length === 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1]);

  if (!validPair(from) || !validPair(to)) {
    throw new Error('❌ Missing or invalid coordinates for mileage lookup');
  }

  // Calculate Route uses latitude,longitude pairs.
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const origin = `${lat1},${lon1}`;
  const dest = `${lat2},${lon2}`;
  const throttleKey = `/mileage/${origin}->${dest}`;

  // Helper: normalize any TomTom geometry to [[lat,lng], ...]
  const toLatLng = (arr) =>
    Array.isArray(arr)
      ? arr
          .map(([lng, lat]) =>
            Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
          )
          .filter(Boolean)
      : [];

  // Default fallback polyline (straight line between the two points)
  const fallbackPolyline = [
    [lat1, lon1],
    [lat2, lon2],
  ];

  try {
    const data = await throttledRequest(
      throttleKey,
      async () => {
        const url =
          `https://api.tomtom.com/routing/1/calculateRoute/` +
          `${origin}:${dest}/json` +
          `?key=${apiKey}&routeType=fastest&traffic=false`;

        const res = await fetch(url);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`TomTom API ${res.status}: ${errText}`);
        }
        return res.json();
      },
      1200 // throttle delay in ms
    );

    const route = data?.routes?.[0];
    if (!route) throw new Error('❌ TomTom returned no routes');

    // Distance in meters
    const distance = Number(route.summary?.lengthInMeters) || 0;

    // Try to extract geometry
    let polyline = [];

    // 1) Try GeoJSON (preferred)
    const geojsonCoords = route?.geometry?.coordinates;
    if (Array.isArray(geojsonCoords) && geojsonCoords.length) {
      polyline = toLatLng(geojsonCoords);
    }

    // 2) Try legs[].points if GeoJSON not usable
    if (!polyline.length && Array.isArray(route?.legs)) {
      const points = route.legs.flatMap((leg) =>
        Array.isArray(leg.points)
          ? leg.points
              .map((p) =>
                Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
                  ? [p.latitude, p.longitude]
                  : null
              )
              .filter(Boolean)
          : []
      );
      if (points.length) polyline = points;
    }

    // 3) Fallback if still nothing
    if (!polyline.length) {
      polyline = fallbackPolyline;
    }

    // If distance invalid, fallback
    if (distance <= 0) {
      console.warn('⚠️ TomTom route distance was zero/invalid. Fallback: 1 mile');
      return { distance: 1609, polyline, raw: data };
    }

    return { distance, polyline, raw: data };
  } catch (err) {
    console.warn(`❌ TomTom mileage fetch failed: ${err.message}. Fallback: 1 mile`);
    return { distance: 1609, polyline: fallbackPolyline, raw: null };
  }
}

export default getTomTomMileage;
