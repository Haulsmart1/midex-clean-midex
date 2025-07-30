// /utils/rateConfig.js

export const vehicleRates = {
  '18 Tonner Tail-lift': 3.5,
  '7.5 Ton Tail-lift': 2.9,
  'Luton Tail-lift': 2.7,
  'XLWB Van': 2.2,
  'LWB Van': 2.0,
  'Midi Van': 1.9,
  'Small Van': 1.8,
};

export const baseRates = {
  UK: { standard: 0, double: 0 },
  INTERNAL: { standard: 0, double: 0 },
  'Cairnryan-Larne': { standard: 350, double: 700 },
  'Liverpool-Dublin': { standard: 400, double: 800 },
  'Holyhead-Dublin': { standard: 400, double: 800 },
  'NI-ROI': { standard: 0, double: 0 },
};

function isInternalRoute(from, to) {
  const f = (from || '').toUpperCase(), t = (to || '').toUpperCase();
  const gb = /^[A-Z]{1,2}\d/.test(f) && /^[A-Z]{1,2}\d/.test(t) && !f.startsWith('BT') && !t.startsWith('BT');
  const ni = f.startsWith('BT') && t.startsWith('BT');
  const roi = /^[DTV]\d/.test(f) && /^[DTV]\d/.test(t);
  const nireland = (f.startsWith('BT') && /^[DTV]\d/.test(t)) || (t.startsWith('BT') && /^[DTV]\d/.test(f));
  return gb || ni || roi || nireland;
}

export function palletUnits(pallets = []) {
  if (!Array.isArray(pallets)) return 0;
  let units = 0;
  for (const p of pallets) {
    if (
      p &&
      typeof p.type === 'string' &&
      p.type.trim() &&
      Number(p.qty) > 0 &&
      Number(p.weight) > 0
    ) {
      const type = p.type.trim().toLowerCase();
      const qty = Number(p.qty);
      if (type === 'double pallet') units += 2 * qty;
      else units += qty;
    }
  }
  return units;
}

export function determineVehicle(pallets, forkliftPickup = false, forkliftDelivery = false) {
  const units = palletUnits(pallets);
  const weight = pallets.reduce(
    (sum, p) => sum + (Number(p.weight) > 0 && Number(p.qty) > 0 ? Number(p.weight) * Number(p.qty) : 0),
    0
  );
  const hasDouble = pallets.some(
    p =>
      p &&
      typeof p.type === 'string' &&
      p.type.toLowerCase().includes('double') &&
      Number(p.weight) > 0
  );
  const hasHeavy = pallets.some(p => Number(p.weight) > 500 && Number(p.qty) > 0);
  const manual = !forkliftPickup || !forkliftDelivery;

  if (manual && (hasHeavy || hasDouble)) return '18 Tonner Tail-lift';
  if (units === 1 && weight <= 500) return 'Small Van';
  if (units <= 2 && weight <= 800) return 'Midi Van';
  if (units <= 3 && weight <= 1100) return 'LWB Van';
  if (units <= 4 && weight <= 1100) return 'XLWB Van';
  if (units <= 2 && weight <= 1000) return 'Luton Tail-lift';
  if (units <= 4 && weight <= 2500) return '7.5 Ton Tail-lift';
  return '18 Tonner Tail-lift';
}

function adrRateMultiplier(adr, special) {
  if (adr && special) return 1.6;
  if (adr) return 1.4;
  return 1;
}

function applyMileageRateWithMinimum(miles, rate) {
  return miles <= 50 ? 160 : 160 + (miles - 50) * rate;
}

export function calculateCollectionCharge(miles, vehicle, adr, adrClassSpecial, isInternal = false) {
  const rate = vehicleRates[vehicle] || 2.5;
  const base = isInternal ? miles * rate : applyMileageRateWithMinimum(miles, rate);
  return Math.round(base * adrRateMultiplier(adr, adrClassSpecial));
}
export function calculateDeliveryCharge(miles, vehicle, adr, adrClassSpecial, isInternal = false) {
  const rate = vehicleRates[vehicle] || 2.5;
  const base = isInternal ? miles * rate : applyMileageRateWithMinimum(miles, rate);
  return Math.round(base * adrRateMultiplier(adr, adrClassSpecial));
}

/**
 * Ferry fee: first 4 get discount, extras are fixed
 * - Standard: after 4, £150 per extra
 * - Double: after 4, £100 per extra
 * Standard includes: pallet, euro, quarter, mini, parcel, barrel, ibc
 */
export function calculateConsignmentCost({ pallets, route = 'UK', adr = false, adrClassSpecial = false }) {
  let routeNorm = (route || '').toLowerCase().replace(/\s+/g, '');
  const routeMap = {
    'cairnryan-larne': 'Cairnryan-Larne',
    'larne-cairnryan': 'Cairnryan-Larne',
    'liverpool-dublin': 'Liverpool-Dublin',
    'dublin-liverpool': 'Liverpool-Dublin',
    'holyhead-dublin': 'Holyhead-Dublin',
    'dublin-holyhead': 'Holyhead-Dublin',
    'ni-roi': 'NI-ROI',
    'roi-ni': 'NI-ROI',
    'uk': 'UK',
    'internal': 'INTERNAL'
  };
  const useRoute = routeMap[routeNorm] || 'UK';
  const rates = baseRates[useRoute] || baseRates.UK;

  // Count types
  let stdCount = 0;
  let dblCount = 0;
  for (const p of pallets || []) {
    if (
      p &&
      typeof p.type === 'string' &&
      Number(p.qty) > 0 &&
      Number(p.weight) > 0
    ) {
      const type = p.type.trim().toLowerCase();
      const qty = Number(p.qty);
      if (
        ['double pallet'].includes(type)
      ) {
        dblCount += qty;
      } else if (
        ['pallet', 'standard pallet', 'euro pallet', 'quarter', 'mini', 'parcel', 'barrel', 'ibc'].includes(type)
      ) {
        stdCount += qty;
      }
    }
  }

  // --- Discount/4-pallet rule logic ---
  let stdFerry = 0;
  let dblFerry = 0;

  // Standard Pallet
  if (stdCount > 0) {
    const stdFirst4 = Math.min(stdCount, 4) * (rates.standard || 0);
    let stdFirst4Total = stdFirst4;
    if (stdCount > 1) stdFirst4Total = stdFirst4Total * 0.75; // 25% off if >1
    const stdExtra = stdCount > 4 ? (stdCount - 4) * 150 : 0;
    stdFerry = Math.round(stdFirst4Total + stdExtra);
  }

  // Double Pallet
  if (dblCount > 0) {
    const dblFirst4 = Math.min(dblCount, 4) * (rates.double || 0);
    let dblFirst4Total = dblFirst4;
    if (dblCount > 1) dblFirst4Total = dblFirst4Total * 0.75; // 25% off if >1
    const dblExtra = dblCount > 4 ? (dblCount - 4) * 100 : 0;
    dblFerry = Math.round(dblFirst4Total + dblExtra);
  }

  let fee = stdFerry + dblFerry;
  fee = Math.round(fee * adrRateMultiplier(adr, adrClassSpecial));

  // DEBUG!
  console.log('FERRY ROUTE DEBUG:', { stdCount, dblCount, stdFerry, dblFerry, fee, pallets });

  return fee;
}

/**
 * Customs fee logic, Brexit/Windsor proof!
 * - GB → NI: customs YES
 * - NI → GB: customs NO
 * - GB ↔ ROI, NI ↔ ROI: customs YES
 * - All others: no customs
 */
export function isCustomsApplicable(from, to) {
  const f = (from || '').toUpperCase();
  const t = (to || '').toUpperCase();

  // NI → GB: no customs
  if (f.startsWith('BT') && /^[A-Z]{1,2}\d/.test(t)) return false;

  // GB → NI: customs YES
  if (/^[A-Z]{1,2}\d/.test(f) && t.startsWith('BT')) return true;

  // Any ROI to GB or NI: customs YES
  const isROI = /^[DTV]\d/.test(f) || /^[DTV]\d/.test(t);
  const isNI = f.startsWith('BT') || t.startsWith('BT');
  const isGB = /^[A-Z]{1,2}\d/.test(f) || /^[A-Z]{1,2}\d/.test(t);

  if (isROI && (isGB || isNI)) return true;

  // All others: no customs
  return false;
}

export function isVatApplicable(from, to) {
  const f = (from || '').toUpperCase();
  const t = (to || '').toUpperCase();
  return !(/^[DTV]\d/.test(f) || /^[DTV]\d/.test(t));
}

export async function calculateQuote({
  from,
  to,
  pallets,
  adr,
  adrClassSpecial,
  forkliftPickup,
  forkliftDelivery,
  distanceMiles = 0,
  milesToDepotA = 0,
  milesFromDepotB = 0,
  ferryRoute = 'UK',
}) {
  const isInternal = isInternalRoute(from, to);
  const vehicle = determineVehicle(pallets, forkliftPickup, forkliftDelivery);
  const units = palletUnits(pallets);

  const collectionCost = calculateCollectionCharge(milesToDepotA, vehicle, adr, adrClassSpecial, isInternal);
  const deliveryCost = calculateDeliveryCharge(milesFromDepotB, vehicle, adr, adrClassSpecial, isInternal);
  const ferryCost = calculateConsignmentCost({ pallets, route: ferryRoute, adr, adrClassSpecial });

  const requiresCustoms = isCustomsApplicable(from, to);
  const vatApplicable = isVatApplicable(from, to);
  const customsFee = requiresCustoms ? 160 : 0;

  const subtotal = collectionCost + deliveryCost + ferryCost + customsFee;
  const vat = vatApplicable ? Math.round(subtotal * 0.2) : 0;

  return {
    vehicle,
    collectionCost,
    deliveryCost,
    ferryCost,
    customsFee,
    vat,
    totalCost: subtotal + vat,
    vatExcluded: !vatApplicable,
    requiresCustoms,
    breakdown: {
      palletUnits: units,
      adr,
      adrClassSpecial,
      forkliftPickup,
      forkliftDelivery,
      ferryRoute,
      milesToDepotA,
      milesFromDepotB,
    },
    pallets,
  };
}
