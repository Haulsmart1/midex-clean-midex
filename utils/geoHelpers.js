/**
 * Convert a position object to [lat, lon]
 * @param {object} obj
 * @returns {[number, number]}
 */
export function toLatLonArray(obj) {
  if (!obj || typeof obj.lat !== 'number' || typeof obj.lon !== 'number') {
    throw new Error('Invalid coordinate object');
  }
  return [obj.lat, obj.lon];
}

/**
 * Get coordinates from a postcode using TomTom Geocoding API
 * @param {string} postcode
 * @returns {Promise<{ lat: number, lon: number }>}
 */
export async function getTomTomCoords(postcode) {
  if (!postcode) throw new Error('Missing postcode');

  const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  if (!apiKey) throw new Error('Missing TOMTOM API key');

  const encoded = encodeURIComponent(postcode);
  const url = `https://api.tomtom.com/search/2/geocode/${encoded}.json?key=${apiKey}&countrySet=GB,IE&limit=1`;

  const response = await fetch(url);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`TomTom Geocode API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const result = data.results?.[0];
  if (!result?.position) {
    throw new Error(`No coordinates found for postcode: ${postcode}`);
  }

  return result.position; // { lat, lon }
}
