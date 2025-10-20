/**
 * Normalize postcode: removes whitespace and uppercases
 */
export function normalizePostcode(postcode = '') {
  return postcode.toString().toUpperCase().replace(/\s+/g, '').trim();
}

// Republic of Ireland (Eircode) routing key prefixes
const ROI_PREFIXES = [
  'A41','A42','A45','A63','C15','D01','D02','D03','D04','D05','D06','D07','D08','D09','D10',
  'D11','D12','D13','D14','D15','D16','D17','D18','D20','D22','D24','D6W','E21','E25','E32',
  'E34','E41','E45','F12','F23','F26','F28','F31','F35','F42','F45','F52','F56','G04','H12',
  'H14','H16','H18','H23','H53','H54','H62','H65','K32','K34','K36','N37','N39','N41','N91',
  'N92','P12','P14','P17','P24','P25','P31','P32','P36','P43','P47','P51','P56','P61','R14',
  'R21','R32','R35','R42','R45','R51','R56','R93','T12','T23','T34','T45','T56','V14','V15',
  'V23','V31','V35','V42','V92','V93','V94','V95','W12','W23','W34','W91','X35','X42','X91',
  'Y14','Y21','Y25','Y34'
];

/**
 * Returns true if postcode is Great Britain (excludes NI, CI, IOM)
 */
export function isGB(postcode = '') {
  const pc = normalizePostcode(postcode);
  if (pc.startsWith('BT') || pc.startsWith('JE') || pc.startsWith('GY') || pc.startsWith('IM')) return false;
  return /^[A-Z]{1,2}\d/.test(pc);
}

/**
 * Returns true if postcode is Northern Ireland (BT)
 */
export function isNI(postcode = '') {
  return normalizePostcode(postcode).startsWith('BT');
}

/**
 * Returns true if postcode is Republic of Ireland (Eircode prefixes)
 */
export function isROI(postcode = '') {
  const pc = normalizePostcode(postcode);
  return ROI_PREFIXES.some(prefix => pc.startsWith(prefix));
}

/**
 * Returns true if postcode is Channel Islands (Jersey/Guernsey)
 */
export function isChannelIslands(postcode = '') {
  const pc = normalizePostcode(postcode);
  return pc.startsWith('JE') || pc.startsWith('GY');
}

/**
 * Returns true if postcode is Isle of Man
 */
export function isIsleOfMan(postcode = '') {
  return normalizePostcode(postcode).startsWith('IM');
}

/**
 * Returns region name for postcode: GB, NI, IE, CI, IOM, EU, UNKNOWN
 */
export function getRegion(postcode = '') {
  if (!postcode) return 'UNKNOWN';
  if (isNI(postcode)) return 'NI';
  if (isChannelIslands(postcode)) return 'CI';
  if (isIsleOfMan(postcode)) return 'IOM';
  if (isROI(postcode)) return 'IE';
  if (isGB(postcode)) return 'GB';
  return 'EU'; // fallback
}

/**
 * Customs required if booking crosses regional customs borders
 */
export function requiresCustoms(fromRegion, toRegion) {
  return (
    (fromRegion === 'GB' && (toRegion === 'IE' || toRegion === 'NI')) ||
    ((fromRegion === 'IE' || fromRegion === 'NI') && toRegion === 'GB') ||
    (fromRegion !== toRegion && (fromRegion === 'EU' || toRegion === 'EU'))
  );
}

/**
 * VAT applied only if both origin and destination are GB
 */
export function requiresVat(fromRegion, toRegion) {
  return fromRegion === 'GB' && toRegion === 'GB';
}

/**
 * Ferry required for water-crossing routes
 */
export function requiresFerry(fromRegion, toRegion) {
  const ferryRoutes = [
    ['GB', 'IE'], ['IE', 'GB'],
    ['GB', 'NI'], ['NI', 'GB'],
    ['GB', 'EU'], ['EU', 'GB'],
  ];
  return ferryRoutes.some(([from, to]) => from === fromRegion && to === toRegion);
}

/**
 * Returns ferry route details (name + approx distance)
 */
export function getFerryRoute(fromRegion, toRegion) {
  if ((fromRegion === 'GB' && toRegion === 'IE') || (fromRegion === 'IE' && toRegion === 'GB')) {
    return { from: 'Holyhead', to: 'Dublin', distance: 70 };
  }
  if ((fromRegion === 'GB' && toRegion === 'NI') || (fromRegion === 'NI' && toRegion === 'GB')) {
    return { from: 'Cairnryan', to: 'Larne', distance: 60 };
  }
  if ((fromRegion === 'GB' && toRegion === 'EU') || (fromRegion === 'EU' && toRegion === 'GB')) {
    return { from: 'Dover', to: 'Calais', distance: 30 };
  }
  return null;
}
