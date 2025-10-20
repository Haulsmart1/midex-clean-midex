export const generateBreakdownFromPallets = (pallets = []) => {
  const breakdown = {
    palletUnits: 0,
    totalWeight: 0,
    forkliftPickup: false,
    tailLiftPickup: false,
    forkliftDelivery: false,
    tailLiftDelivery: false,
    collectionNone: true,
    deliveryNone: true,
    adr: false,
    adrClassSpecial: false,
  };

  for (const p of pallets) {
    const qty = p.qty || 0;
    const weight = p.weight || 0;

    breakdown.palletUnits += qty;
    breakdown.totalWeight += qty * weight;

    if (p.forklift === 'forklift' || p.collectionEquipment === 'forklift')
      breakdown.forkliftPickup = true;

    if (p.forklift === 'tail-lift' || p.collectionEquipment === 'tail-lift')
      breakdown.tailLiftPickup = true;

    if (p.tailLift === 'forklift' || p.deliveryEquipment === 'forklift')
      breakdown.forkliftDelivery = true;

    if (p.tailLift === 'tail-lift' || p.deliveryEquipment === 'tail-lift')
      breakdown.tailLiftDelivery = true;

    if (p.adr) breakdown.adr = true;
    if (['1', '7'].includes(p.adrClass)) breakdown.adrClassSpecial = true;
  }

  breakdown.collectionNone = !breakdown.forkliftPickup && !breakdown.tailLiftPickup;
  breakdown.deliveryNone = !breakdown.forkliftDelivery && !breakdown.tailLiftDelivery;

  return breakdown;
};
