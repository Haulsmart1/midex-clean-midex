import { normalizePostcode, getCoords } from '@/utils/postcodeUtils';
import { getFerryRoute } from '@/utils/ferryRoutes';

export async function determineFerryRoute(fromPostcode, toPostcode) {
  const fromKey = normalizePostcode(fromPostcode);
  const toKey = normalizePostcode(toPostcode);

  const fromCoord = await getCoords(fromKey);
  const toCoord = await getCoords(toKey);

  if (!fromCoord || !toCoord) {
    throw new Error(`⚠️ Unknown postcode(s): ${fromPostcode}, ${toPostcode}`);
  }

  const ferry = getFerryRoute(fromKey, toKey);

  return {
    ferry,
    route: [[fromCoord, toCoord]],
  };
}
