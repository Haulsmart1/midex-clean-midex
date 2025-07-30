import { determineFerryRoute } from '@/lib/determineFerryRoute';
import { getORSRouteSegments } from '@/lib/getORSRouteSegments';
import { getDistanceMiles } from '@/lib/getDistanceMiles';

export async function buildRoute(fromPostcode, toPostcode) {
  const { ferry, route: rawSegments } = await determineFerryRoute(fromPostcode, toPostcode);
  const segments = rawSegments?.filter(([a, b]) => a !== b) || [];

  if (!segments.length) {
    throw new Error('❌ No valid segments generated for routing');
  }

  const orsSegments = await getORSRouteSegments(segments);

  const totalDistanceMiles = orsSegments.reduce((sum, seg) => {
    if (!Array.isArray(seg.from) || !Array.isArray(seg.to)) return sum;
    return sum + getDistanceMiles(seg.from, seg.to);
  }, 0);

  const polyline = orsSegments.flatMap((seg) => seg.polyline || []);

  return {
    ferryRoute: ferry?.name || ferry || null,
    distanceMiles: Number((totalDistanceMiles / 1609.34).toFixed(2)), // meters → miles
    polyline,
  };
}
