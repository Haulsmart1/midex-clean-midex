'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import debounce from 'lodash.debounce';

import { fetchTomTomGeocode, localPostcodeSuggestions } from '@/utils/tomtom';
import styles from '@/styles/BookingWizard.module.css';

function Suggestions({ items = [], onPick = () => {} }) {
  if (!items.length) return null;
  return (
    <div className={styles.suggestBox} role="listbox">
      {items.map((s, i) => (
        <button
          key={`${s.id}-${i}`}
          type="button"
          className={styles.suggestItem}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(s)}
          title={s.source === 'local' ? 'Local suggestion' : 'TomTom'}
          role="option"
        >
          {s.postcode}
          <small className={styles.suggestSub}>{s.label}</small>
        </button>
      ))}
    </div>
  );
}

export default function PointInputs() {
  const { register, setValue } = useFormContext();

  const [collSug, setCollSug] = useState([]);
  const [delSug, setDelSug] = useState([]);
  const [busy, setBusy] = useState({ coll: false, del: false });
  const [warn, setWarn] = useState({ coll: '', del: '' });

  const blurTimer = useRef(null);

  const runLookup = useMemo(
    () =>
      debounce(async (which, text) => {
        const key = which;
        setWarn((w) => ({ ...w, [key]: '' }));

        const value = (text || '').trim();
        if (value.length < 2) {
          key === 'coll' ? setCollSug([]) : setDelSug([]);
          return;
        }

        setBusy((b) => ({ ...b, [key]: true }));
        try {
          const results = await fetchTomTomGeocode(value, { limit: 6 });
          if (results.length) {
            key === 'coll' ? setCollSug(results) : setDelSug(results);
          } else {
            const fallback = localPostcodeSuggestions(value, 5);
            key === 'coll' ? setCollSug(fallback) : setDelSug(fallback);
            setWarn((w) => ({
              ...w,
              [key]: 'TomTom returned 0 results — using local suggestions.',
            }));
          }
        } finally {
          setBusy((b) => ({ ...b, [key]: false }));
        }
      }, 250),
    []
  );

  const pick = (which, item) => {
    const field = which === 'coll' ? 'collectionPoints.0.postcode' : 'deliveryPoints.0.postcode';
    setValue(field, item.postcode, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    which === 'coll' ? setCollSug([]) : setDelSug([]);
  };

  const collReg = register('collectionPoints.0.postcode');
  const delReg = register('deliveryPoints.0.postcode');

  const handleChange = (which, reg) => (e) => {
    reg.onChange(e);
    runLookup(which, e.target.value);
  };

  const handleBlur = (which) => () => {
    clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => {
      which === 'coll' ? setCollSug([]) : setDelSug([]);
    }, 150);
  };

  const handleKeyDown = (which) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const list = which === 'coll' ? collSug : delSug;
      if (list.length) pick(which, list[0]);
    } else if (e.key === 'Escape') {
      which === 'coll' ? setCollSug([]) : setDelSug([]);
    }
  };

  return (
    <div className={styles.pointsCard}>
      <div className={styles.pointsHeader}>Points</div>

      <div className={styles.pointsGrid}>
        {/* Collection */}
        <div className={styles.pointsCol}>
          <label className={styles.pointsLabel} htmlFor="coll-postcode">
            Collection Postcode
          </label>
          <input
            id="coll-postcode"
            className={styles.pointsInput}
            placeholder="e.g., BT1 1AA or D02 YF57"
            {...collReg}
            onChange={handleChange('coll', collReg)}
            onBlur={handleBlur('coll')}
            onKeyDown={handleKeyDown('coll')}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={collSug.length > 0}
            aria-controls="coll-suggest"
          />
          {busy.coll && <div className={styles.pointsHint}>Searching…</div>}
          {!!warn.coll && <div className={styles.pointsWarn}>{warn.coll}</div>}
          <div id="coll-suggest">
            <Suggestions items={collSug} onPick={(s) => pick('coll', s)} />
          </div>
        </div>

        {/* Delivery */}
        <div className={styles.pointsCol}>
          <label className={styles.pointsLabel} htmlFor="del-postcode">
            Delivery Postcode
          </label>
          <input
            id="del-postcode"
            className={styles.pointsInput}
            placeholder="e.g., V94 or 75001 Paris"
            {...delReg}
            onChange={handleChange('del', delReg)}
            onBlur={handleBlur('del')}
            onKeyDown={handleKeyDown('del')}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={delSug.length > 0}
            aria-controls="del-suggest"
          />
          {busy.del && <div className={styles.pointsHint}>Searching…</div>}
          {!!warn.del && <div className={styles.pointsWarn}>{warn.del}</div>}
          <div id="del-suggest">
            <Suggestions items={delSug} onPick={(s) => pick('del', s)} />
          </div>
        </div>
      </div>
    </div>
  );
}
