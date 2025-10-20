/**
 * Normalize postcode by removing spaces and making it uppercase.
 */
export function normalizePostcode(postcode) {
  return postcode?.toString().toUpperCase().replace(/\s+/g, '').trim() || '';
}

// 🇮🇪 Republic of Ireland Eircode routing key prefixes (full list)
const ROI_PREFIXES = [
  'A41', 'A42', 'A45', 'A63', 'C15', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06',
  'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17',
  'D18', 'D20', 'D22', 'D24', 'D6W', 'E21', 'E25', 'E32', 'E34', 'E41', 'E45',
  'F12', 'F23', 'F26', 'F28', 'F31', 'F35', 'F42', 'F45', 'F52', 'F56', 'G04',
  'H12', 'H14', 'H16', 'H18', 'H23', 'H53', 'H54', 'H62', 'H65', 'K32', 'K34',
  'K36', 'N37', 'N39', 'N41', 'N91', 'N92', 'P12', 'P14', 'P17', 'P24', 'P25',
  'P31', 'P32', 'P36', 'P43', 'P47', 'P51', 'P56', 'P61', 'R14', 'R21', 'R32',
  'R35', 'R42', 'R45', 'R51', 'R56', 'R93', 'T12', 'T23', 'T34', 'T45', 'T56',
  'V14', 'V15', 'V23', 'V31', 'V35', 'V42', 'V92', 'V93', 'V94', 'V95', 'W12',
  'W23', 'W34', 'W91', 'X35', 'X42', 'X91', 'Y14', 'Y21', 'Y25', 'Y34'
];

// 🇬🇧 Great Britain postcode area prefixes
const GB_PREFIXES = [
  'AB','AL','B','BA','BB','BD','BH','BL','BN','BR','BS','CA','CB','CF','CH','CM',
  'CO','CR','CT','CV','CW','DA','DD','DE','DG','DH','DL','DN','DT','DY','E','EC',
  'EH','EN','EX','FK','FY','G','GL','GU','GY','HA','HD','HG','HP','HR','HS','HU',
  'HX','IG','IP','IV','JE','KA','KT','KW','KY','L','LA','LD','LE','LL','LN','LS',
  'LU','M','ME','MK','ML','N','NE','NG','NN','NP','NR','NW','OL','OX','PA','PE',
  'PH','PL','PO','PR','RG','RH','RM','S','SA','SE','SG','SK','SL','SM','SN','SO',
  'SP','SR','SS','ST','SW','SY','TA','TD','TF','TN','TQ','TR','TS','TW','UB','W',
  'WA','WC','WD','WF','WN','WR','WS','WV','YO','ZE'
];

/**
 * Get region from postcode.
 * Returns: 'GB', 'NI', 'IE', or 'EU'
 */
export function getRegion(postcode) {
  const p = normalizePostcode(postcode);
  if (!p) return 'UNKNOWN';

  // Northern Ireland
  if (p.startsWith('BT')) return 'NI';

  // Republic of Ireland (Eircodes)
  if (ROI_PREFIXES.some((prefix) => p.startsWith(prefix))) return 'IE';

  // Great Britain (city and region prefixes)
  if (GB_PREFIXES.some((prefix) => p.startsWith(prefix))) return 'GB';

  // Fallback
  return 'EU';
}

/**
 * Region checkers
 */
export function isGB(postcode) {
  return getRegion(postcode) === 'GB';
}

export function isNI(postcode) {
  return getRegion(postcode) === 'NI';
}

export function isROI(postcode) {
  return getRegion(postcode) === 'IE';
}

/**
 * Customs logic
 */
export function requiresCustoms(fromRegion, toRegion) {
  return (
    (fromRegion === 'GB' && (toRegion === 'IE' || toRegion === 'NI')) ||
    ((fromRegion === 'IE' || fromRegion === 'NI') && toRegion === 'GB') ||
    (fromRegion !== toRegion && (fromRegion === 'EU' || toRegion === 'EU'))
  );
}

/**
 * VAT logic — only GB to GB bookings apply VAT
 */
export function requiresVat(fromRegion, toRegion) {
  return fromRegion === 'GB' && toRegion === 'GB';
}

/**
 * Ferry check — if booking crosses water, flag as ferry
 */
export function requiresFerry(fromRegion, toRegion) {
  const routes = [
    ['GB', 'IE'], ['IE', 'GB'],
    ['GB', 'NI'], ['NI', 'GB'],
    ['GB', 'EU'], ['EU', 'GB'],
  ];
  return routes.some(([f, t]) => f === fromRegion && t === toRegion);
}

/**
 * Ferry route logic
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

