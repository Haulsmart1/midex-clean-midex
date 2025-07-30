export function getDistanceMiles(from, to) {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  if (!Array.isArray(from) || !Array.isArray(to)) {
    throw new Error(`❌ Invalid coordinates passed to getDistanceMiles: ${JSON.stringify(from)} → ${JSON.stringify(to)}`);
  }

  const [lon1, lat1] = from.map(Number);
  const [lon2, lat2] = to.map(Number);

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = R * c;

  return +(distanceMeters / 1609.34).toFixed(2); // meters → miles
}
