// /utils/distance.js
import { getCoords } from './normalizePostcode';

export async function getDistanceMiles(fromCoords, toCoords) {
  if (!fromCoords || !toCoords) throw new Error('Missing coords');
  const [fromLng, fromLat] = fromCoords;
  const [toLng, toLat] = toCoords;

  const R = 6371e3;
  const φ1 = (fromLat * Math.PI) / 180;
  const φ2 = (toLat * Math.PI) / 180;
  const Δφ = ((toLat - fromLat) * Math.PI) / 180;
  const Δλ = ((toLng - fromLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return +(d / 1609.34).toFixed(2); // miles
}
