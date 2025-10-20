export function normalizePostcode(postcode) {
  return (postcode || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function getRegion(postcode) {
  const pc = normalizePostcode(postcode);

  if (/^BT/i.test(pc)) return 'NI';
  if (/^(GY|JE|IM)/.test(pc)) return 'GB'; // Islands treated as GB
  if (/^(D|E|F|G|H|K|L|N|P|R|T|V|W|X|Y)/i.test(pc)) return 'ROI'; // Rough ROI prefixes
  if (/^([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})$/i.test(pc)) return 'GB'; // GB format
  if (/^\d{4,5}$/.test(pc)) return 'EU'; // EU (e.g., DE 10115, ES 28013)
  
  return 'EU'; // fallback default
}

export function requiresCustoms(fromRegion, toRegion) {
  const customsMatrix = {
    GB:  { GB: false, NI: true,  ROI: true, EU: true  },
    NI:  { GB: false, NI: false, ROI: false, EU: true  },
    ROI: { GB: true,  NI: false, ROI: false, EU: false },
    EU:  { GB: true,  NI: true,  ROI: false, EU: false },
  };

  return customsMatrix[fromRegion]?.[toRegion] ?? true;
}

export function requiresVat(fromRegion, toRegion) {
  const vatMatrix = {
    GB:  { GB: true, NI: true, ROI: false, EU: false },
    NI:  { GB: true, NI: true, ROI: false, EU: false },
    ROI: { GB: false, NI: false, ROI: false, EU: false },
    EU:  { GB: false, NI: false, ROI: false, EU: false },
  };

  return vatMatrix[fromRegion]?.[toRegion] ?? false;
}

export function requiresFerry(fromRegion, toRegion) {
  const ferryMatrix = {
    GB:  { NI: true, ROI: true, EU: true },
    ROI: { GB: true, EU: true },
    NI:  { GB: true, EU: true },
    EU:  { GB: true, NI: true, ROI: true },
  };

  return ferryMatrix[fromRegion]?.[toRegion] ?? false;
}

export function getFerryRoute(fromRegion, toRegion) {
  const routes = {
    'GB-NI': { from: 'Cairnryan', to: 'Larne', distance: 70 },
    'GB-ROI': { from: 'Holyhead', to: 'Dublin', distance: 80 },
    'GB-EU': { from: 'Dover', to: 'Calais', distance: 25 },
    'ROI-EU': { from: 'Rosslare', to: 'Cherbourg', distance: 120 },
    'NI-EU': { from: 'Larne', to: 'Rotterdam', distance: 180 },
    'EU-GB': { from: 'Calais', to: 'Dover', distance: 25 },
    'EU-NI': { from: 'Rotterdam', to: 'Larne', distance: 180 },
    'EU-ROI': { from: 'Cherbourg', to: 'Rosslare', distance: 120 },
  };

  const key = `${fromRegion}-${toRegion}`;
  return routes[key] || null;
}
