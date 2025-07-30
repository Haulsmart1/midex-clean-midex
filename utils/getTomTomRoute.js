// /utils/getTomTomRoute.js

// Use named export for consistency (can switch to default if you want)
export async function getTomTomRoute(from, to) {
  const TOMTOM_API_KEY = process.env.NEXT_PUBLIC_TOMTOM_KEY || "uMrdzrYcsQezxkJFcAFfxve6EE6YKFyk";

  // Defensive: Check both are objects with lat/lon
  if (
    !from || !to ||
    typeof from.lat !== "number" || typeof from.lon !== "number" ||
    typeof to.lat !== "number" || typeof to.lon !== "number"
  ) {
    throw new Error("Invalid coordinates for TomTom routing!");
  }

  const url = `https://api.tomtom.com/routing/1/calculateRoute/${from.lat},${from.lon}:${to.lat},${to.lon}/json?key=${TOMTOM_API_KEY}&routeType=fastest`;

  const res = await fetch(url);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('TomTom API error: ' + res.status + ' ' + errText);
  }

  const data = await res.json();

  if (!data.routes?.[0]?.summary) {
    throw new Error('No route found');
  }

  const meters = data.routes[0].summary.lengthInMeters || 0;

  // Defensive: build the full polyline array (can be empty)
  const polyline = data.routes[0].legs
    ? data.routes[0].legs.flatMap(leg =>
        (leg.points || []).map(p => [p.latitude, p.longitude])
      )
    : [];

  return {
    distanceMiles: meters / 1609.34,
    polyline, // array of [lat, lon] points, empty if no route
  };
}
