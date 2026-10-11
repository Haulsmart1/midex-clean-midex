import { DEPOTS } from '@/utils/depots';
import { getTomTomCoords } from '@/utils/getTomTomCoords';
import { getTomTomMileage } from '@/utils/getTomTomMileage';
import { toLatLonArray } from '@/utils/toLatLonArray';
import {
  normalizePostcode,
  getRegion,
  requiresCustoms,
  requiresVat,
  requiresFerry,
  getFerryRoute
} from '@/utils/normalizePostcode';
import { KNOWN_LOCATIONS } from '@/utils/KNOWN_LOCATIONS';

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;


function haversineMiles([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.621371;
}

function isValidCoord(pair) {
  if (!Array.isArray(pair) || pair.length !== 2) return false;
  const [lat, lon] = pair;
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

// 🔍 Fallback city/postcode resolver
async function resolveLocation(input) {
  const key = input.toUpperCase().replace(/\s+/g, '');
  const known = KNOWN_LOCATIONS[key];

  if (known) {
    return {
      postcode: known.postcode,
      coords: known.coords,
      region: known.region,
    };
  }

  const obj = await getTomTomCoords(input, TOMTOM_KEY);
  const coords = toLatLonArray(obj);
  const postcode = normalizePostcode(input);
  const region = getRegion(postcode);

  return {
    postcode,
    coords,
    region,
  };
}

/**
 * Fully merged and corrected route resolver
 * Allows override of region detection to avoid postcode misclassification
 */
export async function resolveRoute({
  from,
  to,
  fromRegion: overrideFromRegion,
  toRegion: overrideToRegion,
  travelMode = 'truck',
  allowFerries = true,
  isInternal = false
}) {
  if (!from || !to) throw new Error('Missing origin or destination');

  const fromResolved = await resolveLocation(from);
  const toResolved = await resolveLocation(to);

  const fromRegion = overrideFromRegion || fromResolved.region;
  const toRegion = overrideToRegion || toResolved.region;

  const customsRequired = requiresCustoms(fromRegion, toRegion);
  const vatApplied = requiresVat(fromRegion, toRegion);
  const ferryNeeded = allowFerries && requiresFerry(fromRegion, toRegion);

  let legs = [];
  let ferryRoute = null;

  if (ferryNeeded) {
    const route = getFerryRoute(fromRegion, toRegion);
    if (route) {
      const portFromCoords = DEPOTS[route.from];
      const portToCoords = DEPOTS[route.to];

      legs = [
        {
          from,
          to: route.from,
          fromCoords: fromResolved.coords,
          toCoords: portFromCoords,
          isFerry: false,
        },
        {
          from: route.from,
          to: route.to,
          fromCoords: portFromCoords,
          toCoords: portToCoords,
          isFerry: true,
          ferryRoute: `${route.from}-${route.to}`,
        },
        {
          from: route.to,
          to,
          fromCoords: portToCoords,
          toCoords: toResolved.coords,
          isFerry: false,
        },
      ];

      ferryRoute = `${route.from}-${route.to}`;
    }
  }

  if (!legs.length) {
    legs = [
      {
        from,
        to,
        fromCoords: fromResolved.coords,
        toCoords: toResolved.coords,
        isFerry: false,
      },
    ];
  }

  const legsOut = [];
  const fullPolyline = [];
  let totalMiles = 0;

  for (const leg of legs) {
    if (leg.isFerry) {
      const ferryMiles = getFerryRoute(fromRegion, toRegion)?.distance || 0;
      const points = [leg.fromCoords, leg.toCoords].filter(isValidCoord);
      legsOut.push({ ...leg, distanceMiles: ferryMiles, points, isCustoms: customsRequired });
      fullPolyline.push(...points);
    } else {
      try {
        const mileage = await getTomTomMileage(
          leg.fromCoords,
          leg.toCoords,
          TOMTOM_KEY
        );

        const miles = (mileage?.distance || 0) / 1609.344;
        const rawPoints = mileage?.raw?.routes?.[0]?.legs?.flatMap((l) =>
          l.points?.map((p) => [p.latitude, p.longitude])
        );

        const cleanPoints = (rawPoints || []).filter(isValidCoord);

        if (!cleanPoints.length) throw new Error('No valid route points');

        legsOut.push({
          ...leg,
          distanceMiles: miles,
          points: cleanPoints,
          isCustoms: false,
        });

        totalMiles += miles;
        fullPolyline.push(...cleanPoints);
      } catch (err) {
        const fallbackMiles = haversineMiles(leg.fromCoords, leg.toCoords);
        const fallback = [leg.fromCoords, leg.toCoords].filter(isValidCoord);

        legsOut.push({
          ...leg,
          distanceMiles: fallbackMiles,
          points: fallback,
          error: err.message,
        });

        totalMiles += fallbackMiles;
        fullPolyline.push(...fallback);
      }
    }
  }

  const roadMiles = legsOut.filter((l) => !l.isFerry).reduce((sum, l) => sum + l.distanceMiles, 0);
  const ferryMiles = legsOut.filter((l) => l.isFerry).reduce((sum, l) => sum + l.distanceMiles, 0);
  const collectionMiles = legsOut[0]?.isFerry ? 0 : legsOut[0]?.distanceMiles || 0;
  const deliveryMiles = legsOut.length > 1 && !legsOut.at(-1)?.isFerry ? legsOut.at(-1).distanceMiles : 0;

  return {
    totalMiles,
    roadMiles,
    ferryMiles,
    collectionMiles,
    deliveryMiles,
    middleMiles: Math.max(0, roadMiles - collectionMiles - deliveryMiles),
    legs: legsOut,
    ferryRoute,
    routePolyline: fullPolyline,
    customsRequired,
    vatApplied,
    fromRegion,
    toRegion,
    fromPostcode: fromResolved.postcode,
    toPostcode: toResolved.postcode,
  };
}
