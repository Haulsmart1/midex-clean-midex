'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '@/styles/BookingSliderForm.module.css';
import { calculateQuote } from '@/lib/pricingEngine';
import { getDistance } from '@/utils/distance';


const RoadRouteMap = dynamic(() => import('@/components/maps/ORSRouteMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#eee' }} />,
});

const defaultPallet = { type: 'Standard', weight: '', height: '' };

const initialForm = {
  from: '',
  to: '',
  pickupDate: '',
  pickupTime: '',
  pallets: [defaultPallet],
  forkliftPickup: null,
  forkliftDelivery: null,
  adr: false,
  adrClassSpecial: false,
};

export default function BookingPage() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [quote, setQuote] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const updatePallet = (index, field, value) => {
    const pallets = [...form.pallets];
    pallets[index][field] = value;
    setForm({ ...form, pallets });
  };

  const addPallet = () => {
    setForm({ ...form, pallets: [...form.pallets, defaultPallet] });
  };

  const fetchCoordinates = async (postcode) => {
    const res = await fetch(`/api/geocode?postcode=${encodeURIComponent(postcode)}`);
    const data = await res.json();
    return [data.lng, data.lat];
  };

  const loadRoute = async () => {
    try {
      setMapLoading(true);
      const coordsFrom = await fetchCoordinates(form.from);
      const coordsTo = await fetchCoordinates(form.to);
      const res = await fetch('/api/ors-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: [coordsFrom, coordsTo] }),
      });
      const data = await res.json();
      const geometry = data?.features?.[0]?.geometry?.coordinates;
      if (geometry) setRouteCoords(geometry.map(([lng, lat]) => [lat, lng]));
    } catch (err) {
      console.error('❌ Failed to load route:', err.message);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (form.from && form.to) loadRoute();
  }, [form.from, form.to]);

  useEffect(() => {
    const runQuote = async () => {
      if (!form.from || !form.to || form.pallets.length === 0) return;

      const result = calculateQuote({
        collectionPostcode: form.from,
        deliveryPostcode: form.to,
        pallets: form.pallets,
        hasForkliftPickup: form.forkliftPickup,
        hasForkliftDelivery: form.forkliftDelivery,
        adr: form.adr,
        adrClassSpecial: form.adrClassSpecial,
      });

      setQuote(result.total);
      setBreakdown(result);
    };

    runQuote();
  }, [form]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form, quote, breakdown };
      const res = await fetch('/api/sendBookingAlerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('✅ Booking submitted!');
        setForm(initialForm);
      } else {
        alert('❌ Submission failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🚛 Booking Wizard</h2>

        {step === 0 && (
          <>
            <h3 className={styles.stepHeader}>Step 1: Collection & Delivery</h3>
            <input className={styles.input} placeholder="From Postcode" value={form.from} onChange={(e) => update('from', e.target.value)} />
            <input className={styles.input} placeholder="To Postcode" value={form.to} onChange={(e) => update('to', e.target.value)} />
            {form.from && form.to && (
              <div className="my-4">
                <RoadRouteMap from={form.from} to={form.to} />
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h3 className={styles.stepHeader}>Step 2: Freight Details</h3>
            {form.pallets.map((p, i) => (
              <div key={i} className={styles.row}>
                <select value={p.type} onChange={(e) => updatePallet(i, 'type', e.target.value)} className={styles.input}>
                  <option value="Standard">Standard</option>
                  <option value="Double">Double</option>
                </select>
                <input className={styles.input} placeholder="Weight (kg)" value={p.weight} onChange={(e) => updatePallet(i, 'weight', e.target.value)} />
                <input className={styles.input} placeholder="Height (cm)" value={p.height} onChange={(e) => updatePallet(i, 'height', e.target.value)} />
              </div>
            ))}
            <button className={styles.addBtn} onClick={addPallet}>+ Add Pallet</button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className={styles.stepHeader}>Step 3: Review & Submit</h3>
            {quote && breakdown && (
              <div className="bg-dark p-3 rounded mt-4 text-success border border-success">
                <h5>💸 Quote</h5>
                <p><strong>Total:</strong> £{quote.toFixed(2)}</p>
                <ul>
                  <li>Base: £{breakdown.base.toFixed(2)}</li>
                  <li>Collection: £{breakdown.collection.toFixed(2)}</li>
                  <li>Delivery: £{breakdown.delivery.toFixed(2)}</li>
                  <li>Customs: £{breakdown.customs.toFixed(2)}</li>
                </ul>
              </div>
            )}
          </>
        )}

        <div className={styles.actions}>
          {step > 0 && <button onClick={() => setStep(step - 1)}>⬅ Back</button>}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)}>Next ➡</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✅ Submit Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
