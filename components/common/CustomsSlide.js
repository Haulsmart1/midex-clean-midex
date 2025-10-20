'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import CustomsUpload from '@/components/common/CustomsUpload';
import styles from '@/styles/ConsignmentDetails.module.css';

// ✅ Hardened: covers empty string, bad object, malformed input
const hasDoc = (x) => {
  if (!x) return false;
  if (typeof x === 'string') return x.trim().length > 0;
  if (typeof x === 'object') return !!x.url || !!x.path;
  return false;
};

export default function CustomsSlide({ bookingId, disabled = false }) {
  const { watch, setValue, getValues } = useFormContext();
  const vals = watch();

  const files = vals?.customsFiles || { invoice: null, packing: null, delivery: null };
  const senderEori = vals?.senderEori || '';
  const receiverEori = vals?.receiverEori || '';
  const codes = Array.isArray(vals?.commodityCodes) ? vals.commodityCodes : [];

  const [newCode, setNewCode] = useState('');

  // Upload handler
  const setFile = (key) => (fileObj) =>
    setValue(
      'customsFiles',
      { ...(getValues('customsFiles') || {}), [key]: fileObj },
      { shouldDirty: true }
    );

  // Remove commodity code
  const removeCode = (c) =>
    setValue(
      'commodityCodes',
      (getValues('commodityCodes') || []).filter((x) => x !== c),
      { shouldDirty: true }
    );

  // Add new code safely
  const addCode = () => {
    const code = (newCode || '').trim().toUpperCase();
    if (!code) return;

    const existing = (getValues('commodityCodes') || []).map((c) =>
      (c || '').trim().toUpperCase()
    );

    if (!existing.includes(code)) {
      setValue('commodityCodes', [...existing, code], { shouldDirty: true });
    }

    setNewCode('');
  };

  // Is the step ready?
  const ready = useMemo(() => {
    const docsOK = ['invoice', 'packing', 'delivery'].every((k) => hasDoc(files[k]));
    return (
      docsOK &&
      !!senderEori.trim() &&
      !!receiverEori.trim() &&
      Array.isArray(codes) &&
      codes.length > 0
    );
  }, [files, senderEori, receiverEori, codes]);

  useEffect(() => {
    setValue('__customsReady', ready, { shouldDirty: false });
  }, [ready, setValue]);

  return (
    <div className={styles.consignmentContainer} style={{ maxWidth: 780 }}>
      <p style={{ color: '#9ee', marginTop: 0 }}>
        This route crosses GB/IE — please upload customs documents and provide EORI details.
      </p>

      {/* Invoice */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>📑 Invoice Document *</div>
        <CustomsUpload
          bookingId={bookingId}
          field="invoice"
          value={files.invoice || null}
          setValue={setFile('invoice')}
          multiple={false}
        />
      </div>

      {/* Packing */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>📦 Packing Document *</div>
        <CustomsUpload
          bookingId={bookingId}
          field="packing"
          value={files.packing || null}
          setValue={setFile('packing')}
          multiple={false}
        />
      </div>

      {/* Delivery */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>📃 Delivery Document *</div>
        <CustomsUpload
          bookingId={bookingId}
          field="delivery"
          value={files.delivery || null}
          setValue={setFile('delivery')}
          multiple={false}
        />
      </div>

      {/* EORI */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>🏷️ EORI Numbers</div>
        <div className={styles.grid2}>
          <label>
            Sender EORI *
            <input
              className={styles.input}
              value={senderEori}
              disabled={disabled}
              onChange={(e) => setValue('senderEori', e.target.value, { shouldDirty: true })}
              placeholder="GB123456789000"
            />
          </label>
          <label>
            Receiver EORI/XORI *
            <input
              className={styles.input}
              value={receiverEori}
              disabled={disabled}
              onChange={(e) => setValue('receiverEori', e.target.value, { shouldDirty: true })}
              placeholder="IE1234567AB"
            />
          </label>
        </div>
      </div>

      {/* Commodity Codes */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>📦 Commodity Codes *</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: '0.5rem' }}>
          <input
            className={styles.input}
            style={{ maxWidth: 200 }}
            value={newCode}
            disabled={disabled}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="Add code"
          />
          <button
            type="button"
            className={styles.addBtn}
            onClick={addCode}
            disabled={disabled || !newCode.trim()}
          >
            + Add
          </button>
        </div>

        {!!codes.length && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {codes.map((c) => (
              <span key={c} className={styles.radioPill}>
                {c}
                <button
                  type="button"
                  title="Remove"
                  className={styles.neonDangerBtn}
                  style={{ marginLeft: 6, padding: '0 6px' }}
                  onClick={() => removeCode(c)}
                  disabled={disabled}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {!ready && (
        <div style={{ color: '#ffb4b4', fontWeight: 600, marginTop: '0.5rem' }}>
          Please upload all three documents, fill Sender/Receiver EORI and add at least one commodity code to continue.
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: ready ? '#9f9' : '#f99' }}>
        Customs ready: <b>{ready ? 'YES' : 'NO'}</b>
      </div>
    </div>
  );
}
