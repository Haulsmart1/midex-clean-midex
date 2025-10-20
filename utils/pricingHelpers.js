import {
  palletUnits,
  totalWeightKg,
  determineVehicle,
  vehicleRates,
  EQUIPMENT_FEES,
  FERRY_BASE_FEES,
  FERRY_EXTRA_PER_PALLET,
} from '@/utils/pricingHelpers';

export default function calculateQuote({
  pallets = [],
  legs = [],
  roadMiles = 0,
  ferryMiles = 0,
  totalMiles = 0,
  customsRequired = false,
  vatRequired = false,
  ferryRoute = null,
  adrRequired = false,
  totalUnits = 0,
  totalWeightKg = 0,
  fromPostcode = '',
  toPostcode = '',
  forkliftPickup = false,
  tailLiftPickup = false,
  forkliftDelivery = false,
  tailLiftDelivery = false,
}) {
  const palletUnitsCount = palletUnits(pallets);
  const vehicle = determineVehicle(pallets, forkliftPickup, forkliftDelivery, tailLiftPickup, tailLiftDelivery);
  const ratePerMile = vehicleRates[vehicle] || 2.5;

  // Equipment fee
  let equipmentFee = 0;
  if (tailLiftPickup) equipmentFee += EQUIPMENT_FEES.tailLiftPickup;
  if (tailLiftDelivery) equipmentFee += EQUIPMENT_FEES.tailLiftDelivery;
  if (forkliftPickup) equipmentFee += EQUIPMENT_FEES.forkliftPickup;
  if (forkliftDelivery) equipmentFee += EQUIPMENT_FEES.forkliftDelivery;

  // --- Collection and Delivery Fees ---
  let collectionFee = 0;
  let deliveryFee = 0;

  if (ferryRoute) {
    // Apply minimum £160 if ≤50 miles
    if (roadMiles <= 50) {
      collectionFee = 160;
      deliveryFee = 160;
    } else {
      // Otherwise mileage-based
      collectionFee = ratePerMile * (roadMiles / 2);
      deliveryFee = ratePerMile * (roadMiles / 2);
    }
  } else {
    // No ferry → standard mileage fees
    collectionFee = ratePerMile * (roadMiles / 2);
    deliveryFee = ratePerMile * (roadMiles / 2);
  }

  // Ferry cost
  let ferryTotal = 0;
  if (ferryRoute) {
    const baseFee = FERRY_BASE_FEES[ferryRoute] || 500;
    ferryTotal = baseFee + (palletUnitsCount * FERRY_EXTRA_PER_PALLET);
  }

  // Customs charge (flat rate, e.g. £90)
  const customsTotal = customsRequired ? 90 : 0;

  // ADR surcharge (flat, e.g. £60)
  const adrSurcharge = adrRequired ? 60 : 0;

  // Total before VAT
  const totalExVat =
    collectionFee +
    deliveryFee +
    ferryTotal +
    customsTotal +
    adrSurcharge +
    equipmentFee;

  const vatAmount = vatRequired ? totalExVat * 0.2 : 0;
  const totalIncVat = totalExVat + vatAmount;

  return {
    vehicle,
    collectionFee,
    deliveryFee,
    ferryTotal,
    customsTotal,
    adrSurcharge,
    equipmentFee,
    totalExVat,
    vatApplied: vatRequired,
    vatAmount,
    totalIncVat,
    palletUnits: palletUnitsCount,
    totalWeightKg,
  };
}
