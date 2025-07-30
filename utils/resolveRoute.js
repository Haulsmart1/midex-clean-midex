// /utils/resolveRoute.js

import { DEPOTS } from '@/utils/depots';
import { getTomTomCoords } from '@/utils/getTomTomCoords';
import { getTomTomMileage } from '@/utils/getTomTomMileage';
import { toLatLonArray } from '@/utils/toLatLonArray';

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

const PORTS = {
  Holyhead:    { postcode: 'LL65 1DR', coords: DEPOTS['Holyhead'] },
  Dublin:      { postcode: 'D01 P3K2', coords: DEPOTS['Dublin'] },
  Cairnryan:   { postcode: 'DG9 8RF', coords: DEPOTS['Cairnryan'] },
  Larne:       { postcode: 'BT40 1AW', coords: DEPOTS['Larne'] },
};

// Helper functions to determine UK/NI/ROI
function isGB(pc) {
  if (!pc) return false;
  const upc = String(pc).replace(/\s+/g, '').toUpperCase();
  if (upc.startsWith('BT')) return false;
  if (/^[DTV]\d/i.test(upc)) return false;
  return /^[A-Z]{1,2}\d/.test(upc);
}
function isNI(pc) { return /^BT/i.test(String(pc).replace(/\s+/g, '')); }
function isROI(pc) { return /^[DTV]\d/i.test(String(pc).replace(/\s+/g, '')); }

// Haversine for sanity check
function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Defensively check TomTom's data
function isPolylineNonsense(points, from, to, reportedMiles) {
  if (!points || points.length < 2) return true;
  const start = points[0], end = points[points.length - 1];
  const routeDist = haversineDistance(start, end);
  const directDist = haversineDistance(from, to);
  return (
    routeDist > directDist * 2 ||
    routeDist > 1000 ||
    haversineDistance(start, from) > 100 ||
    haversineDistance(end, to) > 100 ||
    reportedMiles > (directDist * 0.621371) * 2 ||
    reportedMiles > 1000
  );
}

// Ferry segment helpers
function forceHolyheadDublin({ from, to, fromCoords, toCoords }) {
  const UK_PORT = PORTS.Holyhead;
  const IE_PORT = PORTS.Dublin;
  return [
    {
      from,
      to: UK_PORT.postcode,
      fromCoords,
      toCoords: UK_PORT.coords,
      isFerry: false
    },
    {
      from: UK_PORT.postcode,
      to: IE_PORT.postcode,
      fromCoords: UK_PORT.coords,
      toCoords: IE_PORT.coords,
      isFerry: true,
      ferryRoute: 'Holyhead-Dublin'
    },
    {
      from: IE_PORT.postcode,
      to,
      fromCoords: IE_PORT.coords,
      toCoords,
      isFerry: false
    }
  ];
}
function forceCairnryanLarne({ from, to, fromCoords, toCoords }) {
  const GB_PORT = PORTS.Cairnryan;
  const NI_PORT = PORTS.Larne;
  return [
    {
      from,
      to: GB_PORT.postcode,
      fromCoords,
      toCoords: GB_PORT.coords,
      isFerry: false
    },
    {
      from: GB_PORT.postcode,
      to: NI_PORT.postcode,
      fromCoords: GB_PORT.coords,
      toCoords: NI_PORT.coords,
      isFerry: true,
      ferryRoute: 'Cairnryan-Larne'
    },
    {
      from: NI_PORT.postcode,
      to,
      fromCoords: NI_PORT.coords,
      toCoords,
      isFerry: false
    }
  ];
}

export async function resolveRoute({ from, to }) {
  if (!from) throw new Error('Missing origin!');
  if (!to) throw new Error('Missing destination!');

  const fromObj = await getTomTomCoords(from, TOMTOM_KEY);
  const toObj = await getTomTomCoords(to, TOMTOM_KEY);
  const fromCoords = toLatLonArray(fromObj);
  const toCoords = toLatLonArray(toObj);

  let legs = [];
  let ferryRoute = null;

  if ((isGB(from) && isROI(to)) || (isROI(from) && isGB(to))) {
    if (isGB(from)) {
      legs = forceHolyheadDublin({ from, to, fromCoords, toCoords });
    } else {
      legs = forceHolyheadDublin({ from: to, to: from, fromCoords: toCoords, toCoords: fromCoords }).map(
        l => ({
          ...l,
          from: l.to,
          to: l.from,
          fromCoords: l.toCoords,
          toCoords: l.fromCoords
        })
      ).reverse();
    }
    ferryRoute = 'Holyhead-Dublin';
  } else if ((isGB(from) && isNI(to)) || (isNI(from) && isGB(to))) {
    if (isGB(from)) {
      legs = forceCairnryanLarne({ from, to, fromCoords, toCoords });
    } else {
      legs = forceCairnryanLarne({ from: to, to: from, fromCoords: toCoords, toCoords: fromCoords }).map(
        l => ({
          ...l,
          from: l.to,
          to: l.from,
          fromCoords: l.toCoords,
          toCoords: l.fromCoords
        })
      ).reverse();
    }
    ferryRoute = 'Cairnryan-Larne';
  } else if ((isNI(from) && isROI(to)) || (isROI(from) && isNI(to))) {
    legs = [{
      from,
      to,
      fromCoords,
      toCoords,
      isFerry: false
    }];
    ferryRoute = null;
  } else {
    legs = [{
      from,
      to,
      fromCoords,
      toCoords,
      isFerry: false
    }];
    ferryRoute = null;
  }

  // Fetch mileage/polyline for each leg
  let totalMiles = 0;
  let legsOut = [];
  let fullPolyline = [];

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    if (leg.isFerry) {
      legsOut.push({
        ...leg,
        distanceMiles: 0,
        points: [leg.fromCoords, leg.toCoords],
      });
      if (fullPolyline.length === 0) fullPolyline.push(leg.fromCoords);
      fullPolyline.push(leg.toCoords);
    } else {
      try {
        const mileage = await getTomTomMileage(leg.fromCoords, leg.toCoords, TOMTOM_KEY);
        let routePoints =
          mileage.raw?.routes?.[0]?.legs?.[0]?.points?.map(pt => [pt.latitude, pt.longitude]) || [];
        let reportedMiles = (mileage.distance || 0) / 1609.344;
        const havMiles = haversineDistance(leg.fromCoords, leg.toCoords) * 0.621371;
        let fallback = false;

        if (isPolylineNonsense(routePoints, leg.fromCoords, leg.toCoords, reportedMiles)) {
          routePoints = [leg.fromCoords, leg.toCoords];
          fallback = true;
          reportedMiles = havMiles;
          console.warn('TomTom route nonsense detected—fallback to straight line', {
            from: leg.from, to: leg.to, havMiles, reportedMiles
          });
        }

        totalMiles += reportedMiles;
        if (fullPolyline.length === 0 && routePoints.length) fullPolyline.push(routePoints[0]);
        for (let j = 1; j < routePoints.length; j++) fullPolyline.push(routePoints[j]);
        legsOut.push({
          ...leg,
          distanceMiles: reportedMiles,
          points: routePoints,
        });
      } catch (err) {
        // Fallback to straight line if TomTom fails
        const havMiles = haversineDistance(leg.fromCoords, leg.toCoords) * 0.621371;
        legsOut.push({
          ...leg,
          distanceMiles: havMiles,
          points: [leg.fromCoords, leg.toCoords],
          error: 'TomTom failed: ' + err.message,
        });
        totalMiles += havMiles;
        if (fullPolyline.length === 0) fullPolyline.push(leg.fromCoords);
        fullPolyline.push(leg.toCoords);
      }
    }
  }

  // Debug
  if (legsOut.some(l => l.isFerry)) {
    console.log('🧭 ENFORCED FERRY ROUTE:', ferryRoute, legsOut);
  }

  return {
    totalMiles,
    legs: legsOut,
    ferryRoute: ferryRoute || null,
    routePolyline: fullPolyline,
  };
}

// Allow both named and default import
export default resolveRoute;
