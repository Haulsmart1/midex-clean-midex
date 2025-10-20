'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '';

const UK_PC = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/i;       // e.g. BT1 1AA
const IE_PC = /\b([A-Z]\d{2}\s?[A-Z0-9]{4})\b/i;                    // e.g. D02 YF57
const IE_SHORT = /\b([A-Z]\d{2})\b/i;                               // e.g. V94

function normalize(s) {
  return (s || '').toString().toUpperCase().replace(/\s+/g, '').trim();
}

function prettify(s) {
  // reinsert a space for GB formats like BT11AA -> BT1 1AA (roughly)
  const t = (s || '').toUpperCase();
  const m = t.match(UK_PC);
  if (m) {
    const raw = m[1].replace(/\s+/g, '');
    const left = raw.slice(0, raw.length - 3);
    const right = raw.slice(-3);
    return `${left} ${right}`.trim();
  }
  // IE: just uppercase and keep as-is
  return (s || '').toUpperCase().trim();
}

/** Local fallback suggester so the UI still works without a key */
function localSuggest(q) {
  const v = (q || '').toUpperCase().trim();
  if (v.length < 2) return [];
  const candidates = [
    'BT1 1AA', 'BT7 1NN', 'BT12 8EE', 'BT3 9DT',
    'D01 F5P2', 'D02 YF57', 'D04 V4K5',
    'V94', 'V94 X2AA', 'V94 1234',
    'EH3 9GG', 'G1 1XX', 'SW1A 1AA'
  ];
  return candidates
    .filter((c) => c.replace(/\s+/g,'').startsWith(v.replace(/\s+/g,'')))
    .slice(0, 6)
    .map((c) => ({ value: normalize(c), label: c }));
}

export default function PostcodeAutocomplete({
  name,
  label,
  placeholder = 'e.g., BT1 1AA or D02 YF57',
  minChars = 2,
  countrySet = 'GB,IE',
  requireApi = false, // set true if you want to *enforce* TomTom only
}) {
  const { control, setValue } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [q, setQ] = useState(field.value ?? '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const [debug, setDebug] = useState('');
  const boxRef = useRef(null);

  useEffect(() => { setQ(field.value ?? ''); }, [field.value]);

  useEffect(() => {
    const fn = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const fetchSuggestions = useMemo(() => {
    let t;
    return (text) => {
      clearTimeout(t);
      t = setTimeout(async () => {
        const raw = (text || '').trim();
        if (raw.length < minChars) { setItems([]); setOpen(false); return; }

        // Try TomTom first if key present
        if (TOMTOM_KEY) {
          try {
            const url = new URL(`https://api.tomtom.com/search/2/autocomplete/${encodeURIComponent(raw)}.json`);
            url.searchParams.set('key', TOMTOM_KEY);
            url.searchParams.set('limit', '6');
            url.searchParams.set('countrySet', countrySet);
            url.searchParams.set('language', 'en-GB');

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error(`TomTom HTTP ${res.status}`);
            const data = await res.json();

            const options = (data.results || [])
              .map((r) => {
                const pc = r.address?.postalCode || r.highlights?.postalCode || '';
                const ff = r.address?.freeformAddress || r.highlighted || '';
                const base = pc || ff || '';
                const value = normalize(base);
                const label = prettify(base);
                return value ? { value, label } : null;
              })
              .filter(Boolean);

            // If TomTom returned nothing, fall back locally
            if (options.length === 0 && !requireApi) {
              const local = localSuggest(raw);
              setItems(local);
              setActive(0);
              setOpen(local.length > 0);
              setDebug('TomTom returned 0 results; using local fallback.');
              return;
            }

            setItems(options);
            setActive(0);
            setOpen(options.length > 0);
            setDebug('');
            return;
          } catch (e) {
            if (requireApi) {
              setItems([]); setOpen(false);
              setDebug(`TomTom failed: ${e.message}`);
              return;
            }
            // continue to fallback
            setDebug(`TomTom failed (${e.message}); using local fallback.`);
          }
        } else {
          setDebug('No NEXT_PUBLIC_TOMTOM_API_KEY; using local fallback.');
        }

        // Local fallback
        const local = localSuggest(raw);
        setItems(local);
        setActive(0);
        setOpen(local.length > 0);
      }, 220);
    };
  }, [countrySet, minChars, requireApi]);

  const commit = (val) => {
    // accept GB (space insert), IE (allow raw), short IE (e.g. V94)
    let final = val;
    const raw = (val || '').toUpperCase();
    if (UK_PC.test(raw)) final = prettify(raw);
    else if (IE_PC.test(raw)) final = raw.replace(/\s+/g, '').replace(/^([A-Z]\d{2})(.*)$/, (_,$1,$2)=>`${$1} ${$2}`.trim());
    else if (IE_SHORT.test(raw)) final = raw;  // allow short key like V94
    setQ(final);
    setOpen(false);
    setItems([]);
    setValue(name, final, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[active] && commit(items[active].value); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position:'relative', display:'grid', gap:6 }}>
      {label ? <label style={{ color:'#9cc8ff', fontSize:'.9rem' }}>{label}</label> : null}
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); fetchSuggestions(e.target.value); setValue(name, e.target.value.toUpperCase(), { shouldDirty:true }); }}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`bw-input ${fieldState.error ? 'bw-input-error' : ''}`}
      />
      {fieldState.error ? <small style={{ color:'#ff9292' }}>{fieldState.error.message}</small> : null}

      {open && items.length > 0 && (
        <ul
          role="listbox"
          style={{
            position:'absolute', top:'100%', left:0, right:0, zIndex:50,
            marginTop:6, padding:6, listStyle:'none',
            background:'#0f1420', border:'1px solid #152238', borderRadius:10,
            maxHeight:260, overflow:'auto', boxShadow:'0 10px 24px rgba(0,0,0,.35)'
          }}
        >
          {items.map((it, i) => (
            <li
              key={`${it.value}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); commit(it.value); }}
              style={{
                padding:'8px 10px', borderRadius:8, cursor:'pointer',
                background: i === active ? '#132036' : 'transparent',
                display:'flex', gap:8, alignItems:'baseline'
              }}
            >
              <span style={{ color:'#eaf5ff', fontWeight:700 }}>{prettify(it.value)}</span>
              {it.label && it.label !== it.value ? (<span style={{ color:'#9fb2c8', fontSize:'.85rem' }}>{it.label}</span>) : null}
            </li>
          ))}
        </ul>
      )}

      {/* tiny inline debug so you can see why it fails */}
      {debug ? <small style={{ color:'#8fd3ff' }}>{debug}</small> : null}

      <style jsx>{`
        .bw-input {
          width:100%; background:#0b101a; color:#eaf5ff; border:1px solid #1e2a42; border-radius:8px;
          padding:8px 10px; outline:none;
        }
        .bw-input:focus { border-color:#66ccff; box-shadow:0 0 0 2px rgba(102,204,255,.2); }
        .bw-input-error { border-color:#ff7777; }
      `}</style>
    </div>
  );
}

