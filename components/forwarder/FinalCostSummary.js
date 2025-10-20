'use client';
import React from "react";
import SlideContainer from "@/components/common/SlideContainer";

export default function FinalCostSummary({ quote = {}, originalBreakdown = {} }) {
  const safe = v => typeof v === 'number' && !isNaN(v) ? v : 0;
  const collectionMiles = safe(quote.milesToDepotA);
  const deliveryMiles = safe(quote.milesFromDepotB);
  const totalLandMiles = collectionMiles + deliveryMiles;

  return (
    <SlideContainer>
      <div><b>Vehicle:</b> {quote.vehicle || originalBreakdown.vehicle || "-"}</div>
      <div><b>Collection Miles:</b> {collectionMiles.toFixed(2)} mi</div>
      <div><b>Delivery Miles:</b> {deliveryMiles.toFixed(2)} mi</div>
      <div><b>Total Land Miles:</b> {totalLandMiles.toFixed(2)} mi</div>
      <div><b>Collection Fee:</b> £{safe(quote.collectionCost).toFixed(2)}</div>
      <div><b>Delivery Fee:</b> £{safe(quote.deliveryCost).toFixed(2)}</div>
      <div><b>Ferry Fee:</b> £{safe(quote.ferryCost).toFixed(2)}</div>
      <div><b>Customs Fee:</b> £{safe(quote.customsFee).toFixed(2)}</div>
      <div><b>VAT:</b> £{safe(quote.vat).toFixed(2)}</div>
      {originalBreakdown?.total && (
        <div style={{ color: "#ff5dce", marginTop: "1rem" }}>
          <strong>Original Total: £{safe(originalBreakdown.total).toFixed(2)}</strong>
        </div>
      )}
      <div style={{ color: "#0cf", fontWeight: 700, fontSize: 22, marginTop: "0.5rem" }}>
        <strong>Final Total: £{safe(quote.totalCost).toFixed(2)}</strong>
      </div>
    </SlideContainer>
  );
}
