'use client';
import React from 'react';
import SafeMap from '@/components/SafeMap';

export default function BookingReviewSlide({ quote, routeInfo, originalBreakdown }) {
  const safe = v => typeof v === 'number' && !isNaN(v) ? v : 0;

  // Miles breakdown (handle undefined)
  const collectionMiles = safe(quote.milesToDepotA);
  const deliveryMiles = safe(quote.milesFromDepotB);
  const ferryMiles = routeInfo?.legs?.find(leg => leg.isFerry)?.distanceMiles || 0;
  const totalLandMiles = safe(quote.milesToDepotA) + safe(quote.milesFromDepotB);
  const grandMiles = safe(quote.totalMiles) || (routeInfo?.totalMiles || 0);

  return (
    <div style={{ padding: 24 }}>
      {/* Map */}
      <SafeMap legs={routeInfo?.legs || []} />

      {/* Old vs New Price Compare (optional, can remove if not needed) */}
      {originalBreakdown && (
        <div style={{ display: "flex", gap: 36, flexWrap: "wrap", marginTop: 14 }}>
          {/* ...Old Price... */}
          <div style={{ minWidth: 220, flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#7fd6ff" }}>Original Price</div>
            <ul className="list-unstyled mt-2">
              <li>Collection: <b>-</b></li>
              <li>Delivery: <b>-</b></li>
              <li>Ferry: <b>-</b></li>
              <li>Customs: <b>-</b></li>
              <li>VAT: <b>-</b></li>
              <li>Total: <span style={{ fontWeight: 700, fontSize: "1.12em", color: "#55e86b" }}>-</span></li>
            </ul>
          </div>
          {/* ...New Price... */}
          <div style={{ minWidth: 220, flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#13f1fc" }}>New Price</div>
            <ul className="list-unstyled mt-2">
              <li>Collection: <b>£{safe(quote.collectionCost).toFixed(2)}</b></li>
              <li>Delivery: <b>£{safe(quote.deliveryCost).toFixed(2)}</b></li>
              <li>Ferry: <b>£{safe(quote.ferryCost).toFixed(2)}</b></li>
              <li>Customs: <b>£{safe(quote.customsFee).toFixed(2)}</b></li>
              <li>VAT: <b>£{safe(quote.vat).toFixed(2)}</b></li>
              <li>Total: <span style={{ fontWeight: 700, fontSize: "1.18em", color: "#13f1fc" }}>£{safe(quote.totalCost).toFixed(2)}</span></li>
            </ul>
          </div>
        </div>
      )}

      {/* FINAL COST SUMMARY CARD */}
      <div className="cost-summary bg-dark p-4 rounded" style={{ color: "#0cf", fontSize: 18, marginTop: 16 }}>
        <div><b>Vehicle:</b> {quote.vehicle || "-"}</div>
        <div><b>Collection Miles:</b> {collectionMiles.toFixed(2)} mi</div>
        <div><b>Delivery Miles:</b> {deliveryMiles.toFixed(2)} mi</div>
        {ferryMiles > 0 && <div><b>Ferry Miles:</b> {ferryMiles.toFixed(2)} mi</div>}
        <div><b>Total Land Miles:</b> {totalLandMiles.toFixed(2)} mi</div>
        <div style={{ margin: "12px 0 0 0" }}>
          <b>Collection Fee:</b> £{safe(quote.collectionCost).toFixed(2)}
        </div>
        <div><b>Delivery Fee:</b> £{safe(quote.deliveryCost).toFixed(2)}</div>
        <div><b>Ferry Fee:</b> £{safe(quote.ferryCost).toFixed(2)}</div>
        <div><b>Customs Fee:</b> £{safe(quote.customsFee).toFixed(2)}</div>
        <div><b>VAT:</b> £{safe(quote.vat).toFixed(2)}</div>
        <div className="text-success mt-2" style={{ fontWeight: 700, fontSize: 22 }}>
          <strong>Final Total: £{safe(quote.totalCost).toFixed(2)}</strong>
        </div>
      </div>

      {/* Route breakdown */}
      {routeInfo?.legs?.length > 0 && (
        <div className="mt-3" style={{ fontSize: ".98em", color: "#7fd6ff" }}>
          <b>Route legs:</b> {routeInfo.legs.map((leg, i) => (
            <span key={i}>
              {i > 0 && " → "}
              {leg.from} to {leg.to} {leg.isFerry ? "(Ferry)" : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
