// /utils/regionDetect.js

// Returns true if postcode is Great Britain (excludes NI, CI, IOM)
export function isGB(postcode = '') {
  const pc = postcode.replace(/\s+/g, '').toUpperCase();
  if (pc.startsWith('JE') || pc.startsWith('GY') || pc.startsWith('IM')) return false; // Channel Islands/Isle of Man
  if (pc.startsWith('BT')) return false; // Northern Ireland
  // GB postcodes: generally [A-Z]{1,2}\d
  return /^[A-Z]{1,2}\d/.test(pc);
}

// Returns true if postcode is Northern Ireland (BT...)
export function isNI(postcode = '') {
  return postcode.replace(/\s+/g, '').toUpperCase().startsWith('BT');
}

// Returns true if postcode is Republic of Ireland (A9... but not BT or L postcodes)
export function isROI(postcode = '') {
  const pc = postcode.replace(/\s+/g, '').toUpperCase();
  // ROI: single letter + digit, not BT or L
  return /^[A-Z]\d/.test(pc) && !pc.startsWith('BT') && !pc.startsWith('L');
}

// Returns true if Channel Islands (Jersey/Guernsey)
export function isChannelIslands(postcode = '') {
  const pc = postcode.replace(/\s+/g, '').toUpperCase();
  return pc.startsWith('JE') || pc.startsWith('GY');
}

// Returns true if Isle of Man
export function isIsleOfMan(postcode = '') {
  return postcode.replace(/\s+/g, '').toUpperCase().startsWith('IM');
}
