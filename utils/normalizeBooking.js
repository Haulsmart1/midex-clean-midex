// --- Patterns ---
const UK_INLINE = /([A-Z]{1,2}\d{1,2}[A-Z]?)(\s*)(\d[A-Z]{2})/i;        // ...CA75ET / CA7 5ET...
const UK_EXACT = /^([A-Z]{1,2}\d{1,2}[A-Z]?)(\s*)(\d[A-Z]{2})$/i;       // CA75ET / CA7 5ET
const NI_PREFIX = /^BT/i;

const EIRCODE_FULL_INLINE = /([A-Z]\d{2})\s*([A-Z0-9]{4})/i;           // ...V94AB12 / V94 AB12...
const EIRCODE_FULL_EXACT = /^([A-Z]\d{2})\s*([A-Z0-9]{4})$/i;         // V94AB12 / V94 AB12
const EIRCODE_ROUTING_EXACT = /^([A-Z]\d{2})$/i;                      // V94

// --- Normaliser ---
// Extracts and formats valid UK/NI/ROI postcodes. Returns "" if invalid.
export function normalizePostcode(input = "") {
  if (typeof input !== "string") return "";

  const raw = input.trim().toUpperCase();

  // UK (incl NI)
  let m = raw.match(UK_INLINE);
  if (m) return `${m[1]} ${m[3]}`;

  // Full Eircode (ROI)
  m = raw.match(EIRCODE_FULL_INLINE);
  if (m) return `${m[1]} ${m[2]}`;

  // Routing key (ROI)
  m = raw.match(EIRCODE_ROUTING_EXACT);
  if (m) return m[1];

  return "";
}

// --- Region Checkers ---
export function isNI(pc) {
  const n = normalizePostcode(pc);
  return !!n && NI_PREFIX.test(n.replace(/\s+/g, ""));
}

export function isGB(pc) {
  const n = normalizePostcode(pc);
  if (!n) return false;
  return UK_EXACT.test(n) && !isNI(n);
}

export function isROI(pc) {
  const n = normalizePostcode(pc);
  if (!n) return false;
  const c = n.replace(/\s+/g, "");
  return EIRCODE_FULL_EXACT.test(c) || EIRCODE_ROUTING_EXACT.test(c);
}

// --- Customs Logic ---
// Customs required if crossing GB/NI/ROI boundaries.
// Returns false if either side cannot be classified.
export function requiresCustoms(a, b) {
  const A = { gb: isGB(a), ni: isNI(a), roi: isROI(a) };
  const B = { gb: isGB(b), ni: isNI(b), roi: isROI(b) };

  const ok = (x) => x.gb || x.ni || x.roi;
  if (!ok(A) || !ok(B)) return false;

  return A.gb !== B.gb || A.ni !== B.ni || A.roi !== B.roi;
}
