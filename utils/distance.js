// /utils/distance.js

// Haversine formula to calculate distance in miles between two [lat, lon] points
export function haversineMiles([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // Earth radius in kilometers
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.621371; // miles
}

// Async wrapper if you want to use with await
export async function getDistanceMiles(fromCoords, toCoords) {
  if (!fromCoords || !toCoords) throw new Error('Missing coords');
  return haversineMiles(fromCoords, toCoords);
}
