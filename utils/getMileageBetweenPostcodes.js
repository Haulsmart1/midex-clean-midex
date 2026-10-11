import getCoordinatesFromPostcode from '@/utils/getCoordinatesFromPostcode';
import { getTomTomMileage } from '@/utils/getTomTomMileage';

/**
 * Get mileage between two postcodes using TomTom
 * @param {string} fromPostcode
 * @param {string} toPostcode
 * @param {string} apiKey
 * @returns {Promise<{ miles: number, raw: any }>}
 */
export async function getMileageBetweenPostcodes(fromPostcode, toPostcode, apiKey) {
  try {
    const fromCoords = await getCoordinatesFromPostcode(fromPostcode, apiKey);
    const toCoords = await getCoordinatesFromPostcode(toPostcode, apiKey);

    if (!fromCoords || !toCoords) {
      console.warn('⚠️ Missing coordinates, returning 0 miles.');
      return { miles: 0, raw: null };
    }

    const { distance, raw } = await getTomTomMileage(fromCoords, toCoords, apiKey);
    return { miles: distance / 1609.34, raw }; // convert meters → miles
  } catch (err) {
    console.error(`❌ Mileage lookup failed (${fromPostcode} -> ${toPostcode}):`, err);
    // fallback: avoid crashing, return 0 miles
    return { miles: 0, raw: null };
  }
}

export default getMileageBetweenPostcodes;
