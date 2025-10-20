// utils/tomtom.js

// 🌍 Geocode with full Europe, North Africa, Canaries, Turkey, etc.
export async function fetchTomTomGeocode(query, { countrySet, limit = 5 } = {}) {
  if (!query || !process.env.NEXT_PUBLIC_TOMTOM_API_KEY) return [];

  // 🌐 Default country set (EU + extended coverage)
  if (!countrySet) {
    countrySet = [
      'GB', 'IE', 'FR', 'DE', 'NL', 'BE', 'ES', 'PT', 'IT', 'CH', 'AT',
      'DK', 'SE', 'NO', 'FI', 'IS', 'GR', 'CZ', 'SK', 'PL', 'HU', 'RO',
      'BG', 'SI', 'HR', 'RS', 'BA', 'ME', 'MK', 'AL', 'MD', 'UA', 'BY',
      'LT', 'LV', 'EE', 'LU', 'LI', 'MT', 'CY', 'TR', 'RU', 'XK', 'MA',
      'GI', 'FO', 'GL', 'AX', 'IC' // IC = Canary Islands
    ].join(',');
  }

  // 🧼 Clean input — remove suffixes like "UK", punctuation, etc.
  const cleanedQuery = query
    .replace(/,?\s*(FRANCE|UK|IRELAND|GREAT BRITAIN|ENGLAND)$/i, '')
    .replace(/[^\w\s\d\-]/g, '')
    .trim();

  const base = 'https://api.tomtom.com/search/2/geocode';
  const url = `${base}/${encodeURIComponent(cleanedQuery)}.json?key=${process.env.NEXT_PUBLIC_TOMTOM_API_KEY}&countrySet=${encodeURIComponent(countrySet)}&limit=${limit}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const items = (data?.results || []).map((r) => ({
      id: r.id || `${r.position?.lat},${r.position?.lon}`,
      label: r.address?.freeformAddress || r.address?.municipality || cleanedQuery,
      postcode: r.address?.postalCode || cleanedQuery,
      lat: r.position?.lat,
      lon: r.position?.lon,
      source: 'tomtom',
    }));

    return items;
  } catch (e) {
    console.warn('TomTom geocode failed:', e?.message || e);
    return [];
  }
}

// 🧠 Local postcode fallback — UK & Ireland formats
export function localPostcodeSuggestions(prefix, max = 5) {
  if (!prefix) return [];

  const p = prefix.trim().toUpperCase();

  const ukAlphaNum = /^[A-Z]{1,2}\d[A-Z\d]?$/; // UK outward code e.g. CA7, BT1
  const roiAlphaNum = /^[A-Z]\d{1,2}$/;        // ROI routing key e.g. D2, V94

  const out = [];

  // ROI-style Eircode suggestions
  if (/^[A-Z]\d/.test(p)) {
    out.push(
      { id: `${p}X 2AA`, label: `${p}X 2AA`, postcode: `${p}X 2AA`, source: 'local' },
      { id: `${p}1234`,  label: `${p}1234`,  postcode: `${p}1234`,  source: 'local' }
    );
  }

  // UK-style postcode suggestions
  if (ukAlphaNum.test(p)) {
    out.push(
      { id: `${p} 1AA`, label: `${p} 1AA`, postcode: `${p} 1AA`, source: 'local' },
      { id: `${p} 2AB`, label: `${p} 2AB`, postcode: `${p} 2AB`, source: 'local' }
    );
  }

  // Fallback generic
  if (!out.length && /[A-Z0-9]{2,}/.test(p)) {
    out.push({ id: p, label: p, postcode: p, source: 'local' });
  }

  return out.slice(0, max);
}
