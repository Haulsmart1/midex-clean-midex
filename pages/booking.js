'use client';

import { useRouter } from 'next/router';
import LegacyPartnerBookings from '@/components/recovered/LegacyPartnerBookings';
import { releaseRouteAccess } from '@/lib/server/releaseRouteAccess';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '@/styles/BookingSliderForm.module.css';
import calculateQuote from '@/utils/pricingEngine';
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

function BookingPage() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const updatePallet = (index, field, value) => {
    const pallets = [...form.pallets];
    pallets[index] = { ...pallets[index], [field]: value };
    setForm({ ...form, pallets });
  };

  const addPallet = () => {
    setForm({ ...form, pallets: [...form.pallets, { ...defaultPallet }] });
  };

  useEffect(() => {
    let active = true;
    setQuote(null); setBreakdown(null); setQuoteError(''); setRouteCoords([]);
    if (!form.from.trim() || !form.to.trim() || !form.pallets.every(pallet => Number(pallet.weight) > 0 && Number(pallet.height) > 0)) { setMapLoading(false); return; }
    setMapLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/quote', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: form.from, to: form.to, pallets: form.pallets, adr: form.adr, adrClassSpecial: form.adrClassSpecial, forkliftPickup: form.forkliftPickup, forkliftDelivery: form.forkliftDelivery }),
        });
        const data = await response.json();
        if (!response.ok || !Number.isFinite(data.totalIncVat)) throw new Error(data.error || 'Unable to calculate this quote');
        if (active) { setQuote(data.totalIncVat); setBreakdown(data); setRouteCoords(data.routeInfo?.polyline || []); }
      } catch (error) { if (active) setQuoteError(error.message); }
      finally { if (active) setMapLoading(false); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [form]);

  const handleSubmit = async () => {
    if (quote === null || mapLoading) return;
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
                <RoadRouteMap routeLine={{ coordinates: routeCoords.map(([lat, lon]) => [lon, lat]) }} />
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
                  <li>Base: £{(breakdown.middleFee + breakdown.palletTotal + breakdown.ferryTotal).toFixed(2)}</li>
                  <li>Collection: £{breakdown.collectionFee.toFixed(2)}</li>
                  <li>Delivery: £{breakdown.deliveryFee.toFixed(2)}</li>
                  <li>Customs: £{breakdown.customsTotal.toFixed(2)}</li>
                </ul>
              </div>
            )}
          </>
        )}

        {quoteError && <p role="alert">{quoteError}</p>}
        <div className={styles.actions}>
          {step > 0 && <button onClick={() => setStep(step - 1)}>⬅ Back</button>}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)}>Next ➡</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting || mapLoading || quote === null}>
              {submitting ? 'Submitting...' : '✅ Submit Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function getServerSideProps(context) {
 if (context.query.partner) return releaseRouteAccess({ ...context, params: { partner: String(context.query.partner) } }, ['partner'], true);
 return { props: {} };
}
export default function BookingReleasePage() {
 const router = useRouter();
 return router.query.partner ? <LegacyPartnerBookings /> : <BookingPage />;
}
