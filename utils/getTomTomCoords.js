// /utils/getTomTomCoords.js

import { DEPOTS } from '@/utils/depots';

// Map known depots by their postcodes (no spaces, uppercase)
const DEPOT_POSTCODES = Object.entries(DEPOTS).reduce((obj, [name, val]) => {
  if (val.postcode)
    obj[val.postcode.replace(/\s+/g, '').toUpperCase()] = { ...val };
  return obj;
}, {});

// Fallback center for each Eircode region (A, C, D, E, etc)
const EIRCODE_CENTERS = {
  A: { lat: 53.3, lon: -6.6 },   // Dublin North
  C: { lat: 51.9, lon: -8.5 },   // Cork
  D: { lat: 53.35, lon: -6.26 }, // Dublin
  E: { lat: 52.1, lon: -6.93 },  // Wexford
  F: { lat: 53.8, lon: -9.53 },  // Mayo
  H: { lat: 53.27, lon: -9.06 }, // Galway
  K: { lat: 53.15, lon: -6.8 },  // Kildare
  N: { lat: 53.5, lon: -8.6 },   // Longford/Roscommon
  P: { lat: 52.65, lon: -7.25 }, // Kilkenny
  R: { lat: 52.5, lon: -7.6 },   // Tipperary
  T: { lat: 52.47, lon: -8.16 }, // Tipperary
  V: { lat: 52.66, lon: -8.63 }, // Limerick
  W: { lat: 53.28, lon: -7.5 },  // Westmeath
  X: { lat: 52.34, lon: -6.46 }, // Wexford
  Y: { lat: 52.5, lon: -6.4 },   // Wicklow
};

export async function getTomTomCoords(postcode, apiKey) {
  if (!postcode) throw new Error('No postcode supplied!');
  const cleanPC = postcode.replace(/\s+/g, '').toUpperCase();

  // 1️⃣ Check depot/port table
  if (DEPOT_POSTCODES[cleanPC]) {
    const depot = DEPOT_POSTCODES[cleanPC];
    return { lat: depot.lat, lon: depot.lon };
  }

  // 2️⃣ Try TomTom geocoder
  try {
    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(postcode)}.json?countrySet=IE,GB&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length) {
      const pos = data.results[0].position;
      if (pos && typeof pos.lat === 'number' && typeof pos.lon === 'number')
        return { lat: pos.lat, lon: pos.lon };
    }
  } catch (e) {
    // Ignore TomTom errors; will fallback below
  }

  // 3️⃣ Fallback for ROI: Use region center by Eircode first letter
  if (/^[A-Z]\d/i.test(cleanPC)) {
    const region = cleanPC[0];
    if (EIRCODE_CENTERS[region]) {
      console.warn(`TomTom could not resolve ROI postcode ${postcode}, using fallback center for region ${region}`);
      return EIRCODE_CENTERS[region];
    }
  }

  // 4️⃣ Ultimate fallback: Dublin city center
  console.warn(`TomTom and Eircode region fallback failed for postcode: ${postcode}. Using Dublin as default.`);
  return { lat: 53.3498, lon: -6.2603 }; // Dublin
}

export default getTomTomCoords;
