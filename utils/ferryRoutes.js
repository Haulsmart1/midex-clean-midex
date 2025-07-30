export function getFerryRoute(from, to) {
  const fromP = (from || '').toUpperCase();
  const toP = (to || '').toUpperCase();

  const isGB = /^[A-Z]{1,2}\d/.test(fromP) || /^[A-Z]{1,2}\d/.test(toP); // e.g. "M1", "E14"
  const isNI = fromP.startsWith('BT') || toP.startsWith('BT');
  const isROI = /^[DTV]\d/.test(fromP) || /^[DTV]\d/.test(toP); // e.g. D01 F5P2

  if ((isGB && fromP.startsWith('BT')) || (fromP.match(/^[A-Z]{1,2}\d/) && toP.startsWith('BT'))) {
    return 'Cairnryan–Belfast';
  }

  if (isGB && isROI) {
    return 'Liverpool–Dublin';
  }

  if (isNI && isROI) {
    return 'NI–ROI Direct';
  }

  return 'UK'; // or 'INTERNAL'
}
