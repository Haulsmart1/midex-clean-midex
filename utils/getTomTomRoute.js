/**
 * Calls TomTom Routing API and returns distance and road-following polyline.
 * @param {[number, number]} fromCoords - [lat, lon]
 * @param {[number, number]} toCoords - [lat, lon]
 * @returns {Promise<{ distanceMiles: number, polyline: [number, number][], legs: any[] }>}
 */
export async function getTomTomRoute(fromCoords, toCoords) {
  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  if (!apiKey) throw new Error("❌ Missing NEXT_PUBLIC_TOMTOM_API_KEY");

  // ✅ keep lat,lon order for TomTom API
  const url = `https://api.tomtom.com/routing/1/calculateRoute/` +
    `${fromCoords[0]},${fromCoords[1]}:${toCoords[0]},${toCoords[1]}/json` +
    `?key=${apiKey}&travelMode=truck&avoid=unpavedRoads&routeType=fastest`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TomTom Routing failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("❌ No route found");

  const leg = route.legs?.[0];
  const distanceMiles = (leg?.summary?.lengthInMeters || 0) / 1609.34;

  // ✅ keep polyline as [lat, lon]
  const points =
    leg?.points?.map((p) => [p.latitude, p.longitude]) ||
    [fromCoords, toCoords];

  return {
    distanceMiles,
    polyline: points,
    legs: route.legs,
  };
}
