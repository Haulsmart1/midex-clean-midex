import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import desk from '@/lib/freight/desk.cjs';
import local from '@/lib/freight/workspace.cjs';

const initial = { reference: 'MID-DEMO-001', origin: 'Manchester', destination: 'London', weightKg: '500', currency: 'GBP' };
export default function FreightDesk() {
  const [form, setForm] = useState(initial);
  const [workspace, setWorkspace] = useState(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [snapshotRaw, setSnapshotRaw] = useState(null);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [plan, setPlan] = useState({ vehicle: 'Demo rigid', collectionDate: '' });
  const shipment = workspace?.shipment || null;
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const now = () => new Date().toISOString();
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(local.KEY);
      if (raw) { setWorkspace(local.restore(raw)); setSnapshotRaw(raw); setSaved(true); }
    } catch { setRestoreFailed(true); setError('The saved demonstration could not be restored. It has been retained; clear it to start again.'); }
    finally { setReady(true); }
  }, []);
  function save(next) {
    try {
      const raw = local.writeSnapshot(window.localStorage, snapshotRaw, next);
      setSnapshotRaw(raw); setWorkspace(next); setSaved(true);
    } catch (e) {
      if (e.code === 'STALE_DEMO') { setError(e.message); return; }
      setWorkspace(next); setSaved(false); setError('This browser could not save the demonstration. Current changes remain in memory.');
    }
  }
  function clear() {
    try { window.localStorage.removeItem(local.KEY); }
    catch { setError('Saved demonstration could not be cleared.'); return; }
    setWorkspace(null); setSnapshotRaw(null); setSaved(false); setRestoreFailed(false); setError('');
  }
  function run(action) {
    try {
      setError('');
      save(local.dispatch(workspace, action, now()));
    } catch (e) { setError(e.message); }
  }
  function create(event) {
    event.preventDefault();
    try {
      setError('');
      save(local.createWorkspace({ ...form, weightKg: Number(form.weightKg) }, 'demo-shipment', now()));
    } catch (e) { setError(e.message); }
  }
  async function loadBookings() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error(response.status === 401 ? 'Sign in again to view your bookings.' : 'Unable to load bookings.');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Invalid booking response');
      setBookings(rows.map(desk.fromBooking));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  const quotes = shipment ? desk.compareQuotes(shipment, now()) : [];
  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: 24, color: '#f5f5f5', background: '#162536', borderRadius: 12 }}>
      <Head><title>Freight desk | Midnight Express</title></Head>
      <Link href="/dashboard">Back to dashboard</Link>
      <h1>Midnight freight desk</h1>
      <p>Create once, plan, compare transport, book, track, receive POD and close.</p>
      <p role="note"><strong>Local demonstration.</strong> All carriers, prices, awards and tracking events below are simulated. Nothing is published or booked externally. Demo details are saved in this browser so you can resume after a reload. Use synthetic details.</p>
      <p role="status">{!ready ? 'Restoring demonstration…' : saved ? 'Demonstration saved in this browser.' : 'No saved demonstration.'}</p>
      <button disabled={!ready} onClick={clear}>Clear saved demonstration</button>
      {error && <p role="alert" style={{ color: '#ffb6b6' }}>{error}</p>}
      {!ready || restoreFailed ? null : !shipment ? <form onSubmit={create}>
        <h2>Create a demo shipment</h2>
        {['reference', 'origin', 'destination', 'weightKg'].map((key) => <label key={key} style={{ display: 'block', margin: '12px 0' }}>
          {{ reference: 'Shipment reference', origin: 'Collection', destination: 'Delivery', weightKg: 'Weight (kg)' }[key]}
          <input required type={key === 'weightKg' ? 'number' : 'text'} min={key === 'weightKg' ? '0.01' : undefined} step={key === 'weightKg' ? 'any' : undefined} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>)}
        <label>Currency <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['GBP', 'EUR', 'USD'].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        <p><button type="submit">Create demo shipment</button></p>
      </form> : <section aria-label="Demo shipment workflow">
        <h2>{shipment.reference}</h2>
        <p>{shipment.origin} → {shipment.destination} · {shipment.weightKg} kg</p>
        <p role="status">Stage: <strong>{shipment.stage.replaceAll('_', ' ')}</strong></p>
        {shipment.stage === 'draft' && <form onSubmit={(event) => { event.preventDefault(); run({ type: 'plan', ...plan }); }}>
          <label>Vehicle <input required value={plan.vehicle} onChange={(event) => setPlan({ ...plan, vehicle: event.target.value })} /></label>{' '}
          <label>Collection date <input required type="date" value={plan.collectionDate} onChange={(event) => setPlan({ ...plan, collectionDate: event.target.value })} /></label>{' '}
          <button type="submit">Save demo plan</button>
        </form>}
        {shipment.stage === 'planned' && <button onClick={() => run({ type: 'tender' })}>Request local mock quotes</button>}
        {shipment.stage === 'quoted' && <><h3>Compare mock quotes</h3>
        {!quotes.length && <p>These mock quotes have expired. Request fresh quotes to continue this shipment.</p>}
        <button onClick={() => run({ type: 'retender' })}>Refresh local mock quotes</button>
        <div style={{ overflowX: 'auto' }}><table style={{ width: '100%' }}>
          <caption>Like-for-like currency comparison, lowest price first</caption>
          <thead><tr><th scope="col">Carrier</th><th scope="col">Price</th><th scope="col">Expires</th><th scope="col">Award</th></tr></thead>
          <tbody>{quotes.map((quote) => <tr key={quote.id}><td>{quote.carrier}</td><td>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: quote.currency }).format(quote.amountMinor / 100)}</td><td>{quote.expiresAt.slice(0, 10)}</td><td><button onClick={() => run({ type: 'book', quoteId: quote.id })}>Book demo {quote.carrier.slice(-1)}</button></td></tr>)}</tbody>
        </table></div></>}
        {shipment.award && <p>Demo award: {shipment.award.carrier} · {shipment.award.currency} {(shipment.award.amountMinor / 100).toFixed(2)}</p>}
        {shipment.stage === 'booked' && <button onClick={() => run({ type: 'depart' })}>Simulate departure</button>}
        {shipment.stage === 'in_transit' && <button onClick={() => run({ type: 'deliver' })}>Simulate delivery</button>}
        {shipment.stage === 'delivered' && <button onClick={() => run({ type: 'receive_pod', documentRef: 'DEMO-POD-001' })}>Receive simulated POD</button>}
        {shipment.stage === 'pod_received' && <button onClick={() => run({ type: 'close' })}>Close demo shipment</button>}
        {shipment.pod && <p>Simulated POD reference: {shipment.pod.reference}</p>}
        <h3>Shipment event history</h3>
        <ol>{shipment.events.map((event, index) => <li key={index}>{event.type.replaceAll('_', ' ')} · {event.at}</li>)}</ol>
        <button onClick={clear}>Start another demonstration</button>
      </section>}
      <hr />
      <section aria-label="Existing bookings">
        <h2>My existing bookings</h2>
        <p>Read-only planning view. Legacy booking statuses are shown as recorded; demo actions do not change these shipments.</p>
        <button disabled={loading} onClick={loadBookings}>{loading ? 'Loading…' : 'Load my bookings'}</button>
        {bookings && (bookings.length ? <ul>{bookings.map((booking) => <li key={booking.id}>{booking.reference}: {booking.origin || 'Collection unspecified'} → {booking.destination || 'Delivery unspecified'} · {booking.status}</li>)}</ul> : <p>No bookings found.</p>)}
      </section>
    </main>
  );
}
