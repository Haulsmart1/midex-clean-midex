export function getRegion(postcode) {
  const pc = postcode.toUpperCase();

  if (pc.startsWith('BT')) return 'NI';
  if (pc.startsWith('D') || pc.startsWith('K') || pc.startsWith('T')) return 'ROI';
  if (pc.match(/^[A-Z]{1,2}[0-9]/)) return 'GB';

  return 'UNKNOWN';
}

export function isInternalRoute(from, to) {
  const regionA = getRegion(from);
  const regionB = getRegion(to);
  return regionA && regionA === regionB;
}
