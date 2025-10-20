// --- Postcode patterns ---
const UK_EXACT = /^([A-Z]{1,2}\d{1,2}[A-Z]?)(\s*)(\d[A-Z]{2})$/i;  // GB/NI
const NI_PREFIX = /^BT/i;
const EIRCODE_FULL = /^([A-Z]\d{2})\s*([A-Z0-9]{4})$/i;             // ROI
const EIRCODE_ROUTING = /^([A-Z]\d{2})$/i;

// --- Normalise Postcode ---
export function normalizePostcode(input = '') {
  if (typeof input !== 'string') return '';
  const raw = input.trim().toUpperCase();

  // UK (GB or NI)
  let m = raw.match(UK_EXACT);
  if (m) return `${m[1]} ${m[3]}`;

  // ROI Full
  m = raw.match(EIRCODE_FULL);
  if (m) return `${m[1]} ${m[2]}`;

  // ROI routing
  m = raw.match(EIRCODE_ROUTING);
  if (m) return m[1];

  return '';
}

// --- Region Detection ---
export function getRegion(pc) {
  const n = normalizePostcode(pc);
  if (!n) return null;

  const cleaned = n.replace(/\s+/g, '');
  if (NI_PREFIX.test(cleaned)) return 'NI';
  if (UK_EXACT.test(n)) return 'GB';
  if (EIRCODE_FULL.test(cleaned) || EIRCODE_ROUTING.test(cleaned)) return 'ROI';

  // Optional: if external postcode (FR, DE, etc), treat as EU
  return 'EU'; // fallback
}

// --- Customs Logic ---
export function requiresCustoms(fromPc, toPc) {
  const from = getRegion(fromPc);
  const to = getRegion(toPc);

  if (!from || !to) return false;

  if (from === to) return false; // Internal: NI→NI, GB→GB, ROI→ROI, EU→EU

  // NI ↔ ROI = No customs
  if ((from === 'NI' && to === 'ROI') || (from === 'ROI' && to === 'NI')) return false;

  // NI → GB = ❌ No customs (special Brexit arrangement)
  if (from === 'NI' && to === 'GB') return false;

  // All other cross-region = ✅ Customs
  return true;
}

// --- VAT Logic ---
export function requiresVat(fromPc, toPc) {
  const from = getRegion(fromPc);
  const to = getRegion(toPc);

  if (!from || !to) return false;

  // GB → GB or GB ↔ NI = VAT
  if (from === 'GB' && to === 'GB') return true;
  if ((from === 'GB' && to === 'NI') || (from === 'NI' && to === 'GB')) return true;

  // All other cases = no VAT
  return false;
}

// --- Ferry Requirement ---
export function requiresFerry(fromPc, toPc) {
  const from = getRegion(fromPc);
  const to = getRegion(toPc);

  if (!from || !to) return false;

  // Direct land border = no ferry
  if ((from === 'NI' && to === 'ROI') || (from === 'ROI' && to === 'NI')) return false;
  if (from === 'EU' && to === 'EU') return false;

  // GB → NI
  if ((from === 'GB' && to === 'NI') || (from === 'NI' && to === 'GB')) return true;

  // GB → ROI
  if ((from === 'GB' && to === 'ROI') || (from === 'ROI' && to === 'GB')) return true;

  // GB ↔ EU
  if ((from === 'GB' && to === 'EU') || (from === 'EU' && to === 'GB')) return true;

  // NI → EU
  if ((from === 'NI' && to === 'EU') || (from === 'EU' && to === 'NI')) return true;

  // ROI → EU: Sometimes, assume ferry needed
  if ((from === 'ROI' && to === 'EU') || (from === 'EU' && to === 'ROI')) return true;

  return false;
}
