export function getWaypoint(from, to) {
  const fromLC = from.toLowerCase();
  const toLC = to.toLowerCase();

  const isNI = (pc) => pc.startsWith('bt');
  const isROI = (pc) => /^[a-z]{1,2}\d/.test(pc);

  const fromIsNI = isNI(fromLC);
  const toIsNI = isNI(toLC);
  const fromIsROI = isROI(fromLC);
  const toIsROI = isROI(toLC);

  const fromIsUK = !fromIsNI && !fromIsROI;
  const toIsUK = !toIsNI && !toIsROI;

  if (fromIsUK && toIsNI) return 'Cairnryan, Scotland';
  if (fromIsUK && toIsROI) return 'Liverpool, England';
  if (fromIsNI && toIsUK) return 'Belfast, Northern Ireland';
  if (fromIsROI && toIsUK) return 'Dublin Port, Ireland';

  return null;
}
