import { DEPOTS } from '@/utils/depots';
import { throttledRequest } from '@/utils/throttle';
import { normalizePostcode, isROI } from '@/utils/normalizePostcode';

// ── Fast depot lookup by postcode ─────────────────────
const DEPOT_POSTCODES = Object.entries(DEPOTS).reduce((acc, [, v]) => {
  const pc = v?.postcode ? normalizePostcode(v.postcode).replace(/\s+/g, '') : '';
  if (pc) acc[pc] = { lat: Number(v.lat), lon: Number(v.lon) };
  return acc;
}, {});

// ── ROI fallback locations ─────────────────────────────
const EIRCODE_CENTERS = Object.freeze({
  A: { lat: 53.30, lon: -6.60 },
  C: { lat: 51.90, lon: -8.50 },
  D: { lat: 53.35, lon: -6.26 },
  E: { lat: 52.10, lon: -6.93 },
  F: { lat: 53.80, lon: -9.53 },
  H: { lat: 53.27, lon: -9.06 },
  K: { lat: 53.15, lon: -6.80 },
  N: { lat: 53.50, lon: -8.60 },
  P: { lat: 52.65, lon: -7.25 },
  R: { lat: 52.50, lon: -7.60 },
  T: { lat: 52.47, lon: -8.16 },
  V: { lat: 52.66, lon: -8.63 },
  W: { lat: 53.28, lon: -7.50 },
  X: { lat: 52.34, lon: -6.46 },
  Y: { lat: 52.50, lon: -6.40 },
});

// ── Safe defaults if everything fails ─────────────────
const DEFAULT_GB = { lat: 53.8008, lon: -2.4380 }; // UK center
const DEFAULT_IE = { lat: 53.3498, lon: -6.2603 }; // Dublin

// ── Convert lat/lon object to array [lat, lon] ────────
export function toLatLonArray(obj) {
  if (!obj) return null;
  const lat = Number(obj.lat);
  const lon = Number(obj.lon ?? obj.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return [lat, lon];
}

// ── Main resolver ─────────────────────────────────────
/**
 * Resolve coordinates for a UK/IE/EU postcode.
 * Tries: depot hit → TomTom geocode → ROI fallback → default.
 */
export async function getTomTomCoords(postcode, apiKey, opts = {}) {
  if (!postcode || typeof postcode !== 'string') {
    throw new Error('No postcode supplied to getTomTomCoords()');
  }
  if (!apiKey) {
    throw new Error('Missing TomTom API key in getTomTomCoords()');
  }

  const normalized = normalizePostcode(postcode);
  const compact = normalized.replace(/\s+/g, '');
  const isRoi = isROI(normalized);

  // 1️⃣ Fast depot postcode match
  const depot = DEPOT_POSTCODES[compact];
  if (depot && Number.isFinite(depot.lat) && Number.isFinite(depot.lon)) {
    return { lat: depot.lat, lon: depot.lon };
  }

  // 2️⃣ TomTom Geocoding
  try {
    const cacheKey = `/geocode/${compact}`;
    const countries = opts.countrySet || 'IE,GB,FR,DE,NL,BE,LU,CH'; // Support UK, IE + major EU
    const q = encodeURIComponent(normalized);

    const url = `https://api.tomtom.com/search/2/geocode/${q}.json` +
      `?key=${apiKey}&countrySet=${countries}&limit=1&typeahead=false&idxSet=Geo`;

    const data = await throttledRequest(cacheKey, async () => {
      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`TomTom geocode HTTP ${res.status}: ${txt}`);
      }
      return res.json();
    }, opts.throttleMs ?? 1200);

    const pos = data?.results?.[0]?.position;
    if (pos && Number.isFinite(pos.lat) && Number.isFinite(pos.lon)) {
      return { lat: pos.lat, lon: pos.lon };
    }

    // 2b) fallback from viewport centroid
    const entry = data?.results?.[0];
    const viewport = entry?.viewport;
    if (viewport?.topLeftPoint && viewport?.btmRightPoint) {
      const lat = (Number(viewport.topLeftPoint.lat) + Number(viewport.btmRightPoint.lat)) / 2;
      const lon = (Number(viewport.topLeftPoint.lng) + Number(viewport.btmRightPoint.lng)) / 2;
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return { lat, lon };
      }
    }

    console.warn(`⚠️ TomTom returned no usable coords for: ${normalized}`);
  } catch (e) {
    console.warn('⚠️ TomTom geocode error:', e);
  }

  // 3️⃣ ROI fallback via routing-key
  if (isRoi && compact.length === 3) {
    const region = compact[0];
    const center = EIRCODE_CENTERS[region];
    if (center) {
      console.warn(`⚠️ Using ROI routing-key fallback for ${normalized} → ${region}`);
      return { lat: center.lat, lon: center.lon };
    }
  }

  // 4️⃣ Hardcoded national fallback
  return isRoi ? { ...DEFAULT_IE } : { ...DEFAULT_GB };
}

export default getTomTomCoords;
