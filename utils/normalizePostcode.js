// /utils/normalizePostcode.js

const POSTCODES_IO = 'https://api.postcodes.io/postcodes/';

/**
 * 📍 Normalize UK postcode format: "bt744hl" -> "BT74 4HL"
 */
export function normalizePostcode(postcode) {
  const cleaned = postcode?.replace(/\s+/g, '').toUpperCase();
  if (!cleaned) return '';
  const inward = cleaned.slice(-3);
  const outward = cleaned.slice(0, cleaned.length - 3);
  return `${outward} ${inward}`;
}

/**
 * 🇮🇪 Checks if postcode is a Republic of Ireland Eircode (ROI)
 */
export function isROI(postcode) {
  if (!postcode) return false;
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/.test(cleaned); // ROI format: e.g. D01F5P2
}

/**
 * 🌐 Resolve postcode (UK) to lat/lng using postcodes.io
 * @param {string} postcode
 * @returns {[number, number] | null}
 */
export async function resolvePostcodeToLatLng(postcode) {
  const cleaned = postcode?.replace(/\s+/g, '').toUpperCase();
  if (!cleaned) return null;

  try {
    const res = await fetch(`${POSTCODES_IO}${cleaned}`);
    const data = await res.json();

    if (!data?.result) {
      console.warn(`⚠️ Postcode not found: ${postcode}`);
      return null;
    }

    const { latitude, longitude } = data.result;
    return [longitude, latitude]; // [lng, lat]
  } catch (err) {
    console.error(`❌ Failed to resolve postcode: ${postcode}`, err);
    return null;
  }
}
