'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from '@/styles/BookingReviewSlide.module.css';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

export default function BookingReview({ quote = {}, routeInfo = {}, pallets = [] }) {
  const roadMiles = routeInfo.roadMiles ?? 0;
  const ferryMiles = routeInfo.ferryMiles ?? 0;
  const totalMiles = routeInfo.totalMiles ?? (roadMiles + ferryMiles);
  const customsReq = !!routeInfo.customsRequired;

  const palletChargePerUnit = 20;
  const palletUnits = quote?.palletUnits || 0;
  const palletTotal = palletUnits * palletChargePerUnit;

  const consignment = useMemo(() => {
    const collectionEquipment = pallets.some((p) => p.forkliftPickup)
      ? 'Forklift'
      : pallets.some((p) => p.tailLiftPickup)
      ? 'Tail-lift'
      : 'None';

    const deliveryEquipment = pallets.some((p) => p.forkliftDelivery)
      ? 'Forklift'
      : pallets.some((p) => p.tailLiftDelivery)
      ? 'Tail-lift'
      : 'None';

    return {
      consignments: 1,
      units: palletUnits,
      totalWeightKg: quote?.totalWeightKg || 0,
      collectionEquipment,
      deliveryEquipment,
      adr: pallets.some((p) => p.adr),
    };
  }, [pallets, palletUnits, quote?.totalWeightKg]);

  const fmt = (n) => `£${(Number(n) || 0).toFixed(2)}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.visualCard}>
        <RouteMap
          legs={routeInfo?.legs || []}
          polyline={routeInfo?.routePolyline || []}
        />
      </div>

      <div className={styles.infoGrid}>
        <section className={styles.infoCard}>
          <h4 className={styles.cardTitle}>Consignment Details</h4>
          <dl className={styles.kv}>
            <div><dt>Consignments:</dt><dd>{consignment.consignments}</dd></div>
            <div><dt>Pallet Units:</dt><dd>{consignment.units}</dd></div>
            <div><dt>Total Weight:</dt><dd>{consignment.totalWeightKg} kg</dd></div>
            <div><dt>Collection Equipment:</dt><dd>{consignment.collectionEquipment}</dd></div>
            <div><dt>Delivery Equipment:</dt><dd>{consignment.deliveryEquipment}</dd></div>
            <div><dt>ADR:</dt><dd>{consignment.adr ? 'Yes' : 'No'}</dd></div>
          </dl>
        </section>

        <section className={styles.infoCard}>
          <h4 className={styles.cardTitle}>Route</h4>
          <dl className={styles.kv}>
            <div><dt>Vehicle:</dt><dd><strong>{quote?.vehicle || '—'}</strong></dd></div>
            <div><dt>Road:</dt><dd>{roadMiles.toFixed(1)} mi</dd></div>
            <div><dt>Ferry:</dt><dd>{ferryMiles.toFixed(1)} mi</dd></div>
            <div><dt>Total:</dt><dd>{totalMiles.toFixed(1)} mi</dd></div>
            <div><dt>Customs:</dt><dd>{customsReq ? 'Required' : 'Not Required'}</dd></div>
            {routeInfo?.ferryRoute && (
              <div><dt>Ferry Route:</dt><dd>{routeInfo.ferryRoute}</dd></div>
            )}
          </dl>
          {(routeInfo.fromLabel || routeInfo.toLabel) && (
            <div className={styles.routeLabels}>
              {routeInfo.fromLabel && <div><span>Collection:</span> {routeInfo.fromLabel}</div>}
              {routeInfo.toLabel && <div><span>Delivery:</span> {routeInfo.toLabel}</div>}
            </div>
          )}
        </section>
      </div>

      <section className={styles.priceCard}>
        <h4 className={styles.cardTitle}>Price Breakdown</h4>
        <dl className={styles.kv}>
          <div><dt>Collection ({quote.vehicle || '—'}):</dt><dd>{fmt(quote.collectionFee)}</dd></div>
          <div><dt>Delivery ({quote.vehicle || '—'}):</dt><dd>{fmt(quote.deliveryFee)}</dd></div>
          <div><dt>Pallets:</dt><dd>{fmt(palletTotal)} — {palletUnits} units @ {fmt(palletChargePerUnit)}</dd></div>
          <div><dt>Ferry:</dt><dd>{fmt(quote.ferryTotal)} {routeInfo?.ferryRoute ? `— ${routeInfo.ferryRoute}` : ''}</dd></div>
          <div><dt>Customs:</dt><dd>{fmt(quote.customsTotal)} — {customsReq ? 'Applied' : 'Not Required'}</dd></div>
          <div><dt>ADR Surcharge:</dt><dd>{fmt(quote.adrSurcharge)}</dd></div>
          <div><dt>Equipment:</dt><dd>{fmt(quote.equipmentFee)}</dd></div>
          <div><dt>VAT:</dt><dd>{quote.vatApplied ? `${fmt(quote.vatAmount)} — Applied` : 'Not Applied'}</dd></div>
          <div><dt>Total (Ex VAT):</dt><dd>{fmt(quote.totalExVat)}</dd></div>
          {quote.vatApplied && (
            <div><dt>Total (Inc VAT):</dt><dd><strong>{fmt(quote.totalIncVat)}</strong></dd></div>
          )}
        </dl>
      </section>

      <div className={styles.finalTotal}>
        <strong>
          Final Total: {quote.vatApplied ? fmt(quote.totalIncVat) : fmt(quote.totalExVat)}
        </strong>
        <span className={styles.finalMeta}>
          Road: {roadMiles.toFixed(1)} mi | Ferry: {ferryMiles.toFixed(1)} mi | Total: {totalMiles.toFixed(1)} mi | Customs: {customsReq ? 'Applied' : 'Not Required'}
        </span>
      </div>
    </div>
  );
}



