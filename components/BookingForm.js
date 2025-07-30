'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getDistance } from '@/utils/distance';
import {
  determineVehicle,
  calculateConsignmentCost,
  calculateCollectionCharge,
  calculateDeliveryCharge,
} from '@/utils/quoteCalculator';
import styles from '@/styles/Dashboard.module.css';

const RoadRouteMap = dynamic(() => import('@/components/maps/RoadRouteMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#eee' }} />,
});

const defaultPallet = {
  type: 'standard',
  length: 120,
  width: 80,
  height: 180,
  weight: '',
};

const defaultConsignment = () => ({
  collectionPostcode: '',
  collectionAddress: '',
  collectionName: '',
  collectionPhone: '',
  eoriSender: '',
  deliveryPostcode: '',
  deliveryAddress: '',
  deliveryName: '',
  deliveryPhone: '',
  eoriReceiver: '',
  pallets: [structuredClone(defaultPallet)],
  hasForkliftPickup: null,
  hasForkliftDelivery: null,
  adr: false,
  adrClassSpecial: false,
  dgnFile: null,
  invoiceFile: null,
  packingListFile: null,
});

export default function BookingForm({ currentStep, onNext, onBack, onSubmit }) {
  const [consignments, setConsignments] = useState([defaultConsignment()]);
  const [quote, setQuote] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [breakdowns, setBreakdowns] = useState([]);

  const handleChange = (i, key, value) => {
    const updated = [...consignments];
    updated[i][key] = value;
    setConsignments(updated);
  };

  useEffect(() => {
    const autoCalculate = async () => {
      let total = 0;
      const costBreakdowns = [];

      for (const c of consignments) {
        if (!c.collectionPostcode || !c.deliveryPostcode || c.hasForkliftPickup === null || c.hasForkliftDelivery === null) continue;

        const vehicle = determineVehicle(c.pallets, c.hasForkliftPickup, c.hasForkliftDelivery);
        const fromNI = c.collectionPostcode.startsWith('BT');
        const toNI = c.deliveryPostcode.startsWith('BT');
        const toROI = c.deliveryPostcode.startsWith('D');

        const customsRequired = !fromNI && toNI;
        const applyVAT = customsRequired;
        const routeName = toROI ? 'Dublin' : 'Belfast';
        const collectionPort = toROI ? 'L20 1BG' : 'DG9 8RG';
        const deliveryPort = toROI ? 'D01 F5P2' : 'BT29 4GD';

        const collectionMiles = await getDistance(c.collectionPostcode, collectionPort);
        const deliveryMiles = await getDistance(deliveryPort, c.deliveryPostcode);

        const baseCost = calculateConsignmentCost({ pallets: c.pallets, route: routeName, adr: c.adr, adrClassSpecial: c.adrClassSpecial });
        const collectionCharge = calculateCollectionCharge(collectionMiles, vehicle, c.adr);
        const deliveryCharge = calculateDeliveryCharge(deliveryMiles, vehicle, c.adr);
        const customsFee = customsRequired ? 160 : 0;

        const subtotal = baseCost + collectionCharge + deliveryCharge + customsFee;
        const vat = applyVAT ? subtotal * 0.2 : 0;
        const grandTotal = subtotal + vat;

        total += grandTotal;

        costBreakdowns.push({ baseCost, collectionCharge, deliveryCharge, customsFee, vat, total: grandTotal });
      }

      setQuote(total);
      setBreakdowns(costBreakdowns);
    };

    autoCalculate();
  }, [consignments]);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    for (const c of consignments) {
      if (!c.invoiceFile || !c.packingListFile || c.hasForkliftPickup === null || c.hasForkliftDelivery === null || c.pallets.length > 4) {
        setSubmitting(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('bookingData', JSON.stringify({ consignments, totalQuote: quote }));

    consignments.forEach((c, i) => {
      if (c.invoiceFile) formData.append(`invoiceFile_${i}`, c.invoiceFile);
      if (c.packingListFile) formData.append(`packingListFile_${i}`, c.packingListFile);
      if (c.adr && c.dgnFile) formData.append(`dgnFile_${i}`, c.dgnFile);
    });

    await fetch('/api/sendBookingAlerts', {
      method: 'POST',
      body: formData,
    });

    if (onSubmit) onSubmit({ consignments, totalQuote: quote });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleFinalSubmit}>
      <h2>Total Quote: £{quote.toFixed(2)}</h2>

      <div style={{ margin: '1rem 0' }}>
        <RoadRouteMap
          from={consignments[0]?.collectionPostcode}
          to={consignments[0]?.deliveryPostcode}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onBack}>⬅ Back</button>
        <button type="submit" disabled={submitting}>✅ Submit</button>
      </div>
    </form>
  );
}
