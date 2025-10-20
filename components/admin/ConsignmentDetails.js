'use client';

import React from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import styles from '@/styles/ConsignmentDetails.module.css';
import AdrUploader from '@/components/common/AdrUploader';
import DocumentUpload from '@/components/common/DocumentUpload';

export default function ConsignmentDetails({ bookingId }) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({ control, name: 'pallets' });

  const collectionPoints = useWatch({ control, name: 'collectionPoints' }) || [];
  const deliveryPoints = useWatch({ control, name: 'deliveryPoints' }) || [];

  // 🛡️ ensure pallets is always an array
  const rawPallets = useWatch({ control, name: 'pallets' });
  const pallets = Array.isArray(rawPallets) ? rawPallets : [];

  const cp0 = collectionPoints[0]?.postcode || '';
  const dp0 = deliveryPoints[0]?.postcode || '';

  const docUpload = useWatch({ control, name: 'documents' }) || {};

  // 🧮 Summary calculations
  const totalUnits = pallets.reduce((sum, p) => sum + (Number(p?.qty) || 0), 0);
  const totalWeightKg = pallets.reduce(
    (sum, p) => sum + (Number(p?.weight) || 0) * (Number(p?.qty) || 0),
    0
  );

  const addPallet = () =>
    append({
      type: 'Standard 120x100',
      qty: 1,
      weight: 500,
      adr: false,
      adrClass: null,
      forkliftPickup: null,
      tailLiftPickup: null,
      forkliftDelivery: null,
      tailLiftDelivery: null,
      collectionAddress: cp0,
      deliveryAddress: dp0,
      adrFiles: [],
    });

  return (
    <div className={styles.consignmentContainer}>

      {/* --- Consignment Summary --- */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>📦 Consignment Summary</div>
        <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: '1.6em' }}>
          <li><strong>Consignments:</strong> {pallets.length}</li>
          <li><strong>Pallet Units:</strong> {totalUnits}</li>
          <li><strong>Total Weight:</strong> {totalWeightKg} kg</li>
        </ul>
      </div>

      {/* --- Documents Section --- */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>📎 Supporting Documents</div>
        <DocumentUpload
          bookingId={bookingId}
          value={docUpload}
          setValue={(val) => setValue('documents', val, { shouldDirty: true })}
        />
        {!bookingId && (
          <div style={{ color: '#ffb4b4', marginTop: 6 }}>
            ⚠️ Please save the booking before uploading documents.
          </div>
        )}
      </div>

      {/* --- Toolbar --- */}
      <div className={styles.toolbar}>
        <button type="button" onClick={addPallet} className={styles.addBtn}>
          + Add Pallet
        </button>
      </div>

      {fields.length === 0 && <div className={styles.empty}>No pallets added yet.</div>}

      {/* --- Pallet Cards --- */}
      {fields.map((f, idx) => (
        <div key={f.id} className={styles.palletCard}>
          <div className={styles.sectionHeader}>📦 Pallet {idx + 1}</div>

          <div className={styles.gridFive}>
            <label>
              Type*
              <select {...register(`pallets.${idx}.type`, { required: 'Required' })}>
                <option value="Standard 120x100">Standard 120×100</option>
                <option value="Euro 120x80">Euro 120×80</option>
                <option value="Half 80x60">Half 80×60</option>
                <option value="Double 240x100">Double 240×100</option>
              </select>
            </label>

            <label>
              Qty*
              <input
                type="number"
                {...register(`pallets.${idx}.qty`, { required: true, min: 1 })}
              />
            </label>

            <label>
              Weight (kg)*
              <input
                type="number"
                {...register(`pallets.${idx}.weight`, { required: true, min: 1 })}
              />
            </label>

            <label>
              Collection Address*
              <input {...register(`pallets.${idx}.collectionAddress`, { required: true })} />
            </label>

            <label>
              Delivery Address*
              <input {...register(`pallets.${idx}.deliveryAddress`, { required: true })} />
            </label>
          </div>

          {/* Site Equipment */}
          <div className={styles.sectionHeader}>🏗️ Site Equipment</div>
          <div className={styles.grid2}>
            <div>
              <label>Collection Site*</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioPill}>
                  <input
                    type="radio"
                    value="forklift"
                    checked={pallets[idx]?.forkliftPickup === true}
                    onChange={() => {
                      setValue(`pallets.${idx}.forkliftPickup`, true, { shouldDirty: true });
                      setValue(`pallets.${idx}.tailLiftPickup`, false, { shouldDirty: true });
                    }}
                  />
                  <span>Forklift</span>
                </label>
                <label className={styles.radioPill}>
                  <input
                    type="radio"
                    value="taillift"
                    checked={pallets[idx]?.tailLiftPickup === true}
                    onChange={() => {
                      setValue(`pallets.${idx}.tailLiftPickup`, true, { shouldDirty: true });
                      setValue(`pallets.${idx}.forkliftPickup`, false, { shouldDirty: true });
                    }}
                  />
                  <span>Tail-lift</span>
                </label>
              </div>
            </div>

            <div>
              <label>Delivery Site*</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioPill}>
                  <input
                    type="radio"
                    value="forklift"
                    checked={pallets[idx]?.forkliftDelivery === true}
                    onChange={() => {
                      setValue(`pallets.${idx}.forkliftDelivery`, true, { shouldDirty: true });
                      setValue(`pallets.${idx}.tailLiftDelivery`, false, { shouldDirty: true });
                    }}
                  />
                  <span>Forklift</span>
                </label>
                <label className={styles.radioPill}>
                  <input
                    type="radio"
                    value="taillift"
                    checked={pallets[idx]?.tailLiftDelivery === true}
                    onChange={() => {
                      setValue(`pallets.${idx}.tailLiftDelivery`, true, { shouldDirty: true });
                      setValue(`pallets.${idx}.forkliftDelivery`, false, { shouldDirty: true });
                    }}
                  />
                  <span>Tail-lift</span>
                </label>
              </div>
            </div>
          </div>

          {/* ADR */}
          <div className={styles.sectionHeader}>☢️ ADR</div>
          <div className={styles.radioGroup}>
            <label className={styles.radioPill}>
              <input
                type="radio"
                value="true"
                checked={pallets[idx]?.adr === true}
                onChange={() => {
                  setValue(`pallets.${idx}.adr`, true, { shouldDirty: true });
                  setValue('adrRequired', true, { shouldDirty: true });
                }}
              />
              <span>ADR: Yes</span>
            </label>
            <label className={styles.radioPill}>
              <input
                type="radio"
                value="false"
                checked={!pallets[idx]?.adr}
                onChange={() => {
                  setValue(`pallets.${idx}.adr`, false, { shouldDirty: true });
                  setValue(`pallets.${idx}.adrClass`, null, { shouldDirty: true });
                  const stillAdr = pallets.some((p, i) => i !== idx && p.adr === true);
                  setValue('adrRequired', stillAdr, { shouldDirty: true });
                }}
              />
              <span>ADR: No</span>
            </label>
          </div>

          {pallets[idx]?.adr && (
            <>
              <div className={styles.radioGroup} style={{ marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cls) => (
                  <label key={cls} className={styles.radioPill}>
                    <input
                      type="radio"
                      value={cls}
                      checked={Number(pallets[idx]?.adrClass) === cls}
                      onChange={() => setValue(`pallets.${idx}.adrClass`, cls, { shouldDirty: true })}
                    />
                    <span>Class {cls}</span>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <AdrUploader
                  idx={idx}
                  pallets={pallets}
                  setValue={setValue}
                  bookingId={bookingId}
                />
                {!bookingId && (
                  <div style={{ color: '#ffb4b4', marginTop: 6 }}>
                    ⚠️ Please save the booking before uploading ADR files.
                  </div>
                )}
              </div>
            </>
          )}

          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => remove(idx)}
              className={styles.neonDangerBtn}
            >
              ❌ Remove Pallet
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
