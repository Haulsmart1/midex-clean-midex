'use client';

import React, { useMemo } from 'react';

function FinalCostSummary({
  quote = {},
  routeInfo = {},
  originalBreakdown = {},
}) {
  // Safe number conversion
  const n = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
  const fmt = (v, dp = 2) => n(v).toFixed(dp);

  const q = quote;
  const b = q.breakdown || {};

  // Distances
  const collectionMiles = n(q.milesToDepotA ?? b.milesToDepotA);
  const deliveryMiles = n(q.milesFromDepotB ?? b.milesFromDepotB);
  const roadMiles = n(routeInfo.roadMiles ?? q.roadMiles ?? b.roadMiles);
  const ferryMiles = n(routeInfo.ferryMiles ?? q.ferryMiles ?? b.ferryMiles);
  const totalMiles = n(routeInfo.totalMiles ?? q.totalMiles ?? (roadMiles + ferryMiles));

  // Weights & Pallets
  const totalWeight = n(q.totalWeight ?? b.totalWeight);
  const palletUnits = n(q.totalPallets ?? b.palletUnits ?? b.totalPallets);

  // Vehicle logic
  const pickVehicle = ({ totalWeight, palletUnits }) => {
    if (palletUnits <= 1 && totalWeight <= 500) return 'Small Van';
    if (palletUnits <= 6 && totalWeight <= 1200) return 'Luton Van';
    if (palletUnits <= 12 && totalWeight <= 3000) return '7.5T Truck';
    return 'Artic Lorry';
  };

  const vehicle = useMemo(() => {
    const input = q.vehicle;
    return input?.label || input || pickVehicle({ totalWeight, palletUnits });
  }, [q.vehicle, totalWeight, palletUnits]);

  // Fees
  const collectionCost = n(q.collectionCost ?? b.collectionCost);
  const deliveryCost = n(q.deliveryCost ?? b.deliveryCost);
  const ferryCost = n(q.ferryCost ?? b.ferryCost);
  const customsFee = n(q.customsFee ?? b.customsFee);
  const vat = n(q.vat ?? b.vat);
  const totalCost = n(q.totalCost ?? b.totalCost);

  return (
    <div
      className="cost-summary"
      style={{
        color: '#0cf',
        fontSize: 18,
        background: 'rgba(20,24,38,0.98)',
        border: '1px solid #113',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 24px #0aefff28',
        padding: '1.25rem',
      }}
    >
      {/* Vehicle + Weight */}
      <div><b>Vehicle:</b> {vehicle || '-'}</div>
      <div><b>Total Weight:</b> {fmt(totalWeight)} kg</div>
      <div><b>Pallet Units:</b> {fmt(palletUnits, 0)}</div>

      <hr style={{ borderColor: '#113' }} />

      {/* Depot Splits */}
      <div><b>Collection Miles:</b> {fmt(collectionMiles, 1)} mi</div>
      <div><b>Delivery Miles:</b> {fmt(deliveryMiles, 1)} mi</div>

      {/* Route Totals */}
      <div><b>Road Miles:</b> {fmt(roadMiles, 1)} mi</div>
      <div><b>Ferry Miles:</b> {fmt(ferryMiles, 1)} mi</div>
      <div><b>Total Miles:</b> {fmt(totalMiles, 1)} mi</div>

      <hr style={{ borderColor: '#113' }} />

      {/* Cost Breakdown */}
      <div><b>Collection Fee:</b> £{fmt(collectionCost)}</div>
      <div><b>Delivery Fee:</b> £{fmt(deliveryCost)}</div>
      <div><b>Ferry Fee:</b> £{fmt(ferryCost)}</div>
      <div><b>Customs Fee:</b> £{fmt(customsFee)}</div>
      <div><b>VAT:</b> £{fmt(vat)}</div>

      {/* Optional Original Total */}
      {typeof originalBreakdown?.total === 'number' && (
        <div style={{ color: '#ffc107', marginTop: 8 }}>
          <strong>Original Total: £{fmt(originalBreakdown.total)}</strong>
        </div>
      )}

      {/* Final Total */}
      <div
        style={{
          marginTop: 14,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #20c997, #198754)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 22,
          textAlign: 'center',
        }}
      >
        Final Total: £{fmt(totalCost)}
      </div>
    </div>
  );
}

export default FinalCostSummary;
export { FinalCostSummary };
