import { useEnquirySession as useSession } from '@/lib/useEnquirySession';
import { useEffect, useRef, useState } from 'react';
import FreightLayout from '@/components/freight/FreightLayout';
import { fields, labels, dgFields, brief, normalize } from '@/lib/freight/enquiry.cjs';
import s from '@/styles/Enquiry.module.css';

const empty = { mode: 'Please advise', urgency: 'Standard', dangerousGoods: 'Unsure' };
const required = ['collection', 'delivery', 'description', 'name', 'email'];
export default function Enquiry({ deliveryEnabled }) {
  const { data: session, status: sessionStatus, error: sessionError } = useSession();
  const owner = session?.user?.id ? 'account:' + session.user.id : 'guest';
  const [readingFiles, setReadingFiles] = useState(false);
  const [data, setData] = useState(empty);
  const [status, setStatus] = useState(null);
  const uncertain = status?.state === 'unconfirmed';
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState([]);
  const requestId = useRef(null);
  const fileInput = useRef(null);
  const statusRef = useRef(null);
  const submitting = useRef(false);
  const restoredOwner = useRef(null);
  const fileReadGeneration = useRef(0);
  const identity = useRef({ owner, sessionStatus });
  // A late response belongs to the exact session that submitted it, even if
  // that same account signs in again after another account used the tab.
  if (identity.current.owner !== owner || identity.current.sessionStatus !== sessionStatus) { identity.current = { owner, sessionStatus }; fileReadGeneration.current++; }
  useEffect(() => {
    submitting.current = false; setBusy(false); setReadingFiles(false);
    if (sessionStatus === 'loading') return;
    // A transient provider refresh must not discard the same owner's unsent
    // documents or uncertain receipt. A different resolved owner starts clean.
    if (restoredOwner.current === owner) return;
    restoredOwner.current = owner;
    setData(empty); setStatus(null); setDocuments([]);
    if (fileInput.current) fileInput.current.value = '';
    requestId.current = crypto.randomUUID();
    try {
      const saved = JSON.parse(sessionStorage.getItem('midnight-enquiry') || 'null');
      if (saved && (saved.owner || 'guest') === owner && Date.now() - saved.savedAt < 86400000) { setData(saved.data); setStatus(saved.status); requestId.current = saved.requestId || requestId.current; }
      else sessionStorage.removeItem('midnight-enquiry');
    } catch { /* Storage is optional; the email brief remains available. */ }
  }, [owner, sessionStatus]);
  function save(next, nextStatus) {
    try { sessionStorage.setItem('midnight-enquiry', JSON.stringify({ data: next, status: nextStatus, requestId: requestId.current, owner, savedAt: Date.now() })); } catch {}
  }
  function update(key, value) {
    // A timed-out request may already be stored. Preserve its details and key
    // until the receipt is recovered or the customer explicitly clears it.
    if (uncertain) return;
    if (status) requestId.current = crypto.randomUUID();
    const next = { ...data, [key]: value };
    setData(next); setStatus(null); save(next, null);
  }
  function field(key, options) {
    const id = 'enquiry-' + key;
    const props = { id, name: key, value: data[key] || '', required: required.includes(key), onChange: event => update(key, event.target.value) };
    return <div className={s.field} key={key}><label htmlFor={id}>{labels[key]}{required.includes(key) ? ' (required)' : ''}</label>{options ? <select {...props}>{options.map(option => <option key={option}>{option}</option>)}</select> : ['description', 'notes'].includes(key) ? <textarea {...props} maxLength={fields[key]} rows={3}/> : <input {...props} maxLength={fields[key]} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} autoComplete={({ name: 'name', company: 'organization', email: 'email', phone: 'tel' })[key] || 'off'}/>}</div>;
  }
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const submittedIdentity = identity.current;
    let payload;
    try { payload = { ...normalize(data), requestId: requestId.current, attachments: documents }; } catch (error) { setStatus({ state: uncertain ? 'unconfirmed' : 'invalid', message: error.message }); return; }
    submitting.current = true; setBusy(true);
    const pending = { state: 'unconfirmed', message: 'Receipt has not been confirmed. Retry without changing the enquiry to check the same submission, or call operations.' };
    setStatus(pending); save(data, pending);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      const result = await response.json();
      if (identity.current !== submittedIdentity) return;
      if (!['received', 'accepted', 'unconfirmed', 'unavailable', 'limited', 'invalid'].includes(result.state)) throw new Error('Unexpected response');
      if (['received','accepted'].includes(result.state) && !response.ok) throw new Error('Unconfirmed response');
      const nextStatus = uncertain && !['received','accepted'].includes(result.state) ? {...result, state:'unconfirmed'} : result;
      setStatus(nextStatus); save(data, nextStatus);
    } catch { if (identity.current === submittedIdentity) { setStatus(pending); save(data, pending); } }
    finally { clearTimeout(timer); if (identity.current === submittedIdentity) { setBusy(false); submitting.current = false; statusRef.current?.focus(); } }
  }
  // Session refreshes can temporarily remove the user. Keep the owner-bound
  // draft in memory/storage, but never expose it while identity is unresolved.
  if (sessionStatus === 'loading' || restoredOwner.current !== owner) return <FreightLayout title="Request a Freight Quotation | Midnight Express" path="/enquiry"><div className={s.container}><h1>Checking your sign-in</h1><p role="status">{sessionError ? 'Your sign-in could not be checked. Reload this page or call operations. Your draft remains hidden and an earlier submission may still complete.' : 'Your draft is hidden while we check your session. No new enquiry can be submitted while your session is checked.'}</p></div></FreightLayout>;
  const text = brief(data);
  return <FreightLayout title="Request a Freight Quotation | Midnight Express" description="Prepare a road, air or sea freight enquiry for UK, European and international movements. Share locations, cargo details and delivery requirements with operations." path="/enquiry">
    <div className={s.container}>
      <h1>Tell us what needs to move</h1>
      <p>Road, air or sea. Share what you know; operations will confirm the practical options, availability and quotation. Fields marked required help us respond. Other details can follow.</p>
      <p>Time-critical? Call <a href="tel:+448009991263">0800 999 1263</a>.</p>
      {!deliveryEnabled && <p className={s.notice}>Prepare a shipment brief below, then send it using your email app or call operations. Your enquiry has not been sent.</p>}
      <form onSubmit={submit}>
        <fieldset disabled={busy || readingFiles || uncertain || sessionStatus === 'loading'}><legend>Your movement</legend><div className={s.grid}>
          {field('mode', ['Please advise', 'Road', 'Air', 'Sea'])}{field('urgency', ['Standard', 'Urgent', 'Time-critical'])}
          {field('collection')}{field('delivery')}{field('ready')}{field('deadline')}
        </div><p>Include the country and town, postcode, airport or port where known. Give dates, local times and any firm delivery deadline.</p></fieldset>
        <fieldset disabled={busy || readingFiles || uncertain || sessionStatus === 'loading'}><legend>Your freight</legend>{field('description')}<div className={s.grid}>{field('pieces')}{field('dimensions')}{field('weight')}{field('dangerousGoods', ['Unsure', 'No', 'Yes'])}</div>
          {data.dangerousGoods !== 'No' && <><p>If applicable, add the details you have. Leave unknown details blank. Acceptance must be confirmed for the proposed mode and route.</p><div className={s.grid}>{dgFields.map(key => field(key))}</div></>}
        </fieldset>
        <fieldset disabled={busy || readingFiles || uncertain || sessionStatus === 'loading'}><legend>Your contact details</legend><div className={s.grid}>{field('name')}{field('company')}{field('email')}{field('phone')}</div>{field('notes')}</fieldset>
        {deliveryEnabled && <fieldset disabled={busy || readingFiles || sessionStatus === 'loading'}><legend>Shipment documents (optional)</legend>
          <label htmlFor="enquiry-files">SDS, DGN, packing list or photographs</label>
          <input ref={fileInput} id="enquiry-files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={async event => {
            const readingIdentity = identity.current;
            const generation = ++fileReadGeneration.current;
            const isCurrentRead = () => identity.current === readingIdentity && fileReadGeneration.current === generation;
            const input = event.target;
            const files = Array.from(event.target.files || []);
            if (!files.length) { setReadingFiles(false); return; }
            if (files.length > 3 || files.some(file => file.size > 1048576)) { setReadingFiles(false); setStatus({state:uncertain?'unconfirmed':'invalid',message:'Choose up to three PDF, PNG or JPEG files, each 1 MB or smaller. Your previous documents are retained.'}); input.value=''; return; }
            setReadingFiles(true);
            try { const values = await Promise.all(files.map(file => new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload=()=>resolve({name:file.name,content:String(reader.result).split(',')[1]}); reader.onerror=reject; reader.readAsDataURL(file); })));
              if (!isCurrentRead()) return;
              setDocuments(values); if(status?.state === 'received') requestId.current=crypto.randomUUID(); if(!uncertain) setStatus(null);
            } catch { if (isCurrentRead()) { input.value=''; setStatus({state:uncertain?'unconfirmed':'invalid',message:'Could not read the documents. Your previous documents are retained. Please select them again.'}); } } finally { if (isCurrentRead()) setReadingFiles(false); }
          }}/>{documents.length > 0 && <p>Ready to attach: {documents.map(file => file.name).join(', ')}</p>}<p>Up to three PDF, PNG or JPEG files, 1 MB each. Files are stored privately with your enquiry. After a refresh, reselect the same files before retrying an uncertain submission.</p>
        </fieldset>}
        <p>We use these details to handle your freight enquiry. <a href="/privacy">Privacy and cookies</a>. This tab saves a draft and restores it for up to 24 hours. Clear it below when finished, especially on a shared device. Documents are uploaded only when you submit and are not saved in this browser draft. Do not include passwords or payment-card details.</p>
        {deliveryEnabled && <button type="submit" disabled={busy || readingFiles || sessionStatus === 'loading' || status?.state === 'received'}>{busy ? 'Checking receipt…' : 'Submit enquiry'}</button>}
      </form>
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className={status ? s.notice : ''}>{status?.message}{status?.reference && <p>Reference: <strong>{status.reference}</strong></p>}</div>
      <h2>Your shipment brief</h2>
      <p>The email link opens your email app; you must send the message there. You can also copy the brief into your own email to <a href="mailto:freight@midnight-express.org">freight@midnight-express.org</a>.</p>
      {uncertain && <p>Receipt is uncertain. Your details are locked to preserve the original submission. Reselect the same documents after a refresh, then retry to recover its receipt, or call operations before starting another enquiry.</p>}
      <label htmlFor="enquiry-brief">Copyable shipment details</label><textarea id="enquiry-brief" readOnly rows={10} value={text}/>
      <div className={s.actions}><a href={'mailto:freight@midnight-express.org?subject=' + encodeURIComponent('Midnight freight enquiry') + '&body=' + encodeURIComponent(text)}>Open enquiry in email app</a><button type="button" disabled={busy || readingFiles || sessionStatus === 'loading'} onClick={() => { if(uncertain && !window.confirm('This enquiry may already be stored. Clearing its draft prevents receipt recovery here. Call operations before submitting a replacement. Clear it anyway?')) return; fileReadGeneration.current++; setData(empty); setStatus(null); setDocuments([]); if (fileInput.current) fileInput.current.value = ''; requestId.current = crypto.randomUUID(); try { sessionStorage.removeItem('midnight-enquiry'); } catch {} }}>Clear draft</button></div>
    </div>
  </FreightLayout>;
}
export async function getServerSideProps({ res }) {
  const { configured } = require('../lib/server/enquiryCapture.cjs');
  res.setHeader('Cache-Control', 'private, no-store');
  return { props: { deliveryEnabled: configured(process.env) } };
}
Enquiry.freightMarketing = true;
