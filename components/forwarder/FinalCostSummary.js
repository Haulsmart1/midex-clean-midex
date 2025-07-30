'use client';
import React from "react";

/**
 * Accessible final cost summary with full mileage breakdown.
 * @param {object} quote - The live quote object
 * @param {object} originalBreakdown - (Optional) The original quote breakdown (for comparison)
 */
export default function FinalCostSummary({ quote = {}, originalBreakdown = {} }) {
  // Defensive helper for safe number display
  const safe = v => typeof v === 'number' && !isNaN(v) ? v : 0;

  // Labelled breakdown for accessibility
  const collectionMiles = safe(quote.milesToDepotA);
  const deliveryMiles = safe(quote.milesFromDepotB);
  const totalLandMiles = collectionMiles + deliveryMiles;

  return (
    <div className="cost-summary bg-dark p-4 rounded" style={{ color: "#0cf", fontSize: 18 }}>
      <div>
        <b>Vehicle:</b> {quote.vehicle || originalBreakdown.vehicle || "-"}
      </div>
      <div>
        <b>Collection Miles:</b> {collectionMiles.toFixed(2)} mi
      </div>
      <div>
        <b>Delivery Miles:</b> {deliveryMiles.toFixed(2)} mi
      </div>
      <div>
        <b>Total Land Miles:</b> {totalLandMiles.toFixed(2)} mi
      </div>
      <div>
        <b>Collection Fee:</b> £{safe(quote.collectionCost).toFixed(2)}
      </div>
      <div>
        <b>Delivery Fee:</b> £{safe(quote.deliveryCost).toFixed(2)}
      </div>
      <div>
        <b>Ferry Fee:</b> £{safe(quote.ferryCost).toFixed(2)}
      </div>
      <div>
        <b>Customs Fee:</b> £{safe(quote.customsFee).toFixed(2)}
      </div>
      <div>
        <b>VAT:</b> £{safe(quote.vat).toFixed(2)}
      </div>
      {originalBreakdown?.total && (
        <div className="text-warning mt-2">
          <strong>Original Total: £{safe(originalBreakdown.total).toFixed(2)}</strong>
        </div>
      )}
      <div className="text-success mt-2" style={{ fontWeight: 700, fontSize: 22 }}>
        <strong>Final Total: £{safe(quote.totalCost).toFixed(2)}</strong>
      </div>
    </div>
  );
}
