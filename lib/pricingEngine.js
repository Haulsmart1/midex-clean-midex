import {
  determineVehicle,
  calculateCollectionCharge,
  calculateDeliveryCharge,
  calculateConsignmentCost,
  isCustomsApplicable,
  isVatApplicable,
  palletUnits,
} from '@/utils/rateConfig';

// 🚚 Master Quote Calculator (3-leg aware)
export async function calculateQuote({
  from,
  to,
  pallets = [],
  adr = false,
  adrClassSpecial = false,
  forkliftPickup = false,
  forkliftDelivery = false,
  milesToDepotA = 0,
  milesFromDepotB = 0,
  ferryRoute = 'Cairnryan-Belfast',
}) {
  const vehicle = determineVehicle(pallets, forkliftPickup, forkliftDelivery);
  const units = palletUnits(pallets);

  const collectionCost = calculateCollectionCharge(
    milesToDepotA,
    vehicle,
    adr,
    adrClassSpecial
  );

  const deliveryCost = calculateDeliveryCharge(
    milesFromDepotB,
    vehicle,
    adr,
    adrClassSpecial
  );

  const ferryCost = calculateConsignmentCost({
    pallets,
    route: ferryRoute,
    adr,
    adrClassSpecial,
  });

  const requiresCustoms = isCustomsApplicable(from, to);
  const customsFee = requiresCustoms ? 160 : 0;

  const vatApplicable = isVatApplicable(from, to);
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
    requiresCustoms,
    vatApplicable,        // <--- ADDED for UI
    ferryRoute,           // <--- ADDED for UI
    milesToDepotA,
    milesFromDepotB,
    breakdown: {
      palletUnits: units,
      adr,
      adrClassSpecial,
      forkliftPickup,
      forkliftDelivery,
      milesToDepotA,
      milesFromDepotB,
      ferryRoute,
    },
  };
}

// Named export for utils
export { palletUnits };
