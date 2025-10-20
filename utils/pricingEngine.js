
import {
  palletUnits,
  totalWeightKg,
  determineVehicle,
  vehicleRates,
  FERRY_BASE_FEES,
  FERRY_EXTRA_PER_PALLET,
  EQUIPMENT_FEES,
  ADR_SURCHARGE_RATES,
} from '@/utils/rateConfig';

/**
 * Calculates pricing for a booking based on pallets, route, and requirements.
 */
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
    middleFee + // ✅ Fix: middle miles included
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
