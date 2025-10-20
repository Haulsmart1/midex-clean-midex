
// ---------- PALLET UNITS ----------
const rawSizeFactor = {
  'standard 120x100': 1,
  'standard 120x80': 1,
  'IBC 120x120': 1,
  'euro 120x80': 1,
  'half 120x80': 1,
  'half': 1,
  'double 240x100': 2,
  'double': 2,
  'oversize': 2,
};

const SIZE_FACTOR = Object.fromEntries(
  Object.entries(rawSizeFactor).map(([key, val]) => [key.trim().toLowerCase(), val])
);

export function palletUnits(pallets = []) {
  return pallets.reduce((sum, p) => {
    const raw = (p?.type || '').toString();
    const type = raw.trim().toLowerCase();
    const factor = SIZE_FACTOR[type] ?? 1;
    const qty = Number(p?.qty) || 0;
    return sum + factor * qty;
  }, 0);
}

export function totalWeightKg(pallets = []) {
  return pallets.reduce((sum, p) => {
    const w = Number(p?.weightKg ?? p?.weight) || 0;
    const q = Number(p?.qty) || 0;
    return sum + w * q;
  }, 0);
}

// ---------- VEHICLES + RATES ----------
export const vehicleRates = {
  'Small Van': 1.80,
  'LWB': 2.00,
  'Sprinter': 2.20,
  'Luton Tail-lift': 2.70,
  'Luton Curtain': 2.70,
  '7.5T Tail-lift': 2.99,
  '18 Tonner Tail-lift': 3.50,
  '26 Tonner Tail-lift': 4.00,
  'Artic Lorry': 4.50,
};

export function determineVehicle(pallets = [], forkCol, forkDel, tailCol, tailDel) {
  const units = palletUnits(pallets);
  const kg = totalWeightKg(pallets);

  if (kg <= 500 && units <= 1) return 'Small Van';
  if (kg <= 1200 && units <= 3) return 'LWB';
  if (kg <= 1100 && units <= 4) return 'Sprinter';
  if (kg <= 1000 && units <= 6) return 'Luton Tail-lift';
  if (kg <= 1000 && units <= 6) return 'Luton Curtain';
  if (kg <= 2300 && units <= 12) return '7.5T Tail-lift';
  if (kg <= 9000 && units <= 14) return '18 Tonner Tail-lift';
  if (kg <= 12000 && units <= 14) return '26 Tonner Tail-lift';
  if (kg <= 24500 && units <= 24) return '44 Tonner';
  return 'Artic Lorry';
}

// ---------- FERRY PRICING ----------
export const FERRY_BASE_FEES = {
  'Holyhead-Dublin': 700,
  'Cairnryan-Larne': 600,
  'Fishguard-Rosslare': 650,
  'Dover-Calais': 550,
};

export const FERRY_EXTRA_PER_PALLET = 50;

// ---------- EQUIPMENT FEES ----------
export const EQUIPMENT_FEES = {
  tailLiftPickup: 15,
  tailLiftDelivery: 15,
  forkliftPickup: 0,
  forkliftDelivery: 0,
};

// ---------- ADR SURCHARGE RATES ----------
export const ADR_SURCHARGE_RATES = {
  lower: 120, // Classes 2, 3, 4, 5, 6, 8, 9
  higher: 220, // Classes 1, 7
};

// ---------- MAIN QUOTE CALCULATION ----------
export default function calculateQuote({
  pallets = [],
  legs = [],
  collectionMiles = 0,
  deliveryMiles = 0,
  middleMiles = 0,
  ferryMiles = 0,
  totalMiles = 0,
  customsRequired = false,
  vatRequired = false,
  ferryRoute = null,
  adr = false,
  forkliftPickup = false,
  forkliftDelivery = false,
  tailLiftPickup = false,
  tailLiftDelivery = false,
}) {
  const palletCount = palletUnits(pallets);
  const weightKg = totalWeightKg(pallets);

  const vehicle = determineVehicle(
    pallets,
    forkliftPickup,
    forkliftDelivery,
    tailLiftPickup,
    tailLiftDelivery
  );

  const perMileRate = vehicleRates[vehicle] || 2.5;

  const collectionFee = collectionMiles * perMileRate;
  const deliveryFee = deliveryMiles * perMileRate;
  const middleFee = middleMiles * perMileRate;

  const palletUnitPrice = 20;
  const palletTotal = palletCount * palletUnitPrice;

  const ferryBase = ferryRoute ? (FERRY_BASE_FEES[ferryRoute] || 0) : 0;
  const ferryExtra = palletCount * FERRY_EXTRA_PER_PALLET;
  const ferryTotal = ferryRoute ? ferryBase + ferryExtra : 0;

  const customsTotal = customsRequired ? 180 : 0;

  let adrSurcharge = 0;
  if (adr && pallets.length > 0) {
    for (const pallet of pallets) {
      const qty = Number(pallet?.qty) || 0;
      const adrClass = parseInt(pallet?.adrClass, 10);

      if ([2, 3, 4, 5, 6, 8, 9].includes(adrClass)) {
        adrSurcharge += qty * ADR_SURCHARGE_RATES.lower;
      } else if ([1, 7].includes(adrClass)) {
        adrSurcharge += qty * ADR_SURCHARGE_RATES.higher;
      }
    }
  }

  const equipmentFee =
    (tailLiftPickup ? EQUIPMENT_FEES.tailLiftPickup : 15) +
    (tailLiftDelivery ? EQUIPMENT_FEES.tailLiftDelivery : 15) +
    (forkliftPickup ? EQUIPMENT_FEES.forkliftPickup : 0) +
    (forkliftDelivery ? EQUIPMENT_FEES.forkliftDelivery : 0);

  const totalExVat =
    collectionFee +
    deliveryFee +
    middleFee +
    palletTotal +
    ferryTotal +
    customsTotal +
    adrSurcharge +
    equipmentFee;

  const vatAmount = vatRequired ? totalExVat * 0.2 : 0;
  const totalIncVat = totalExVat + vatAmount;

  return {
    vehicle,
    palletUnits: palletCount,
    totalWeightKg: weightKg,
    collectionFee,
    deliveryFee,
    middleFee,
    palletTotal,
    ferryTotal,
    customsTotal,
    adrSurcharge,
    equipmentFee,
    totalExVat,
    vatApplied: vatRequired,
    vatAmount,
    totalIncVat,
  };
}
