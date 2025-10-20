'use client';

import React, { useEffect } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import styles from '@/styles/Requirements.module.css';

export default function Requirements() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const {
    fields: colFields,
    append: appendCol,
    remove: removeCol,
  } = useFieldArray({ control, name: 'collectionPoints' });

  const {
    fields: delFields,
    append: appendDel,
    remove: removeDel,
  } = useFieldArray({ control, name: 'deliveryPoints' });

  const collections = useWatch({ control, name: 'collectionPoints' }) || [];
  const deliveries = useWatch({ control, name: 'deliveryPoints' }) || [];

  useEffect(() => {
    if (!collections.length) appendCol({ postcode: '', address: '', contact: '', phone: '', ref: '', notes: '' });
    if (!deliveries.length) appendDel({ postcode: '', address: '', contact: '', phone: '', ref: '', notes: '' });
  }, []);

  const addCollection = () =>
    appendCol({ postcode: collections[0]?.postcode || '', address: '', contact: '', phone: '', ref: '', notes: '' });

  const addDelivery = () =>
    appendDel({ postcode: deliveries[0]?.postcode || '', address: '', contact: '', phone: '', ref: '', notes: '' });

  return (
    <div className={styles.consignmentContainer}>

      {/* Collections */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>Collections</div>
        <div className={styles.toolbar}>
          <button type="button" className={styles.addBtn} onClick={addCollection}>+ Add Collection</button>
        </div>

        {colFields.map((f, i) => (
          <div key={f.id} className={styles.card} style={{ marginTop: 10 }}>
            <div className={styles.cardHead}>
              <strong>Collection #{i + 1}</strong>
              <button type="button" className={styles.removeBtn} onClick={() => removeCol(i)}>✕</button>
            </div>

            <div className={styles.grid}>
              <div>
                <label>Reference</label>
                <input {...register(`collectionPoints.${i}.ref`)} placeholder="Optional reference" />
              </div>
              <div>
                <label>Contact</label>
                <input {...register(`collectionPoints.${i}.contact`)} placeholder="Name" />
              </div>
              <div>
                <label>Phone</label>
                <input {...register(`collectionPoints.${i}.phone`)} placeholder="Phone" />
              </div>
              <div className={styles.colSpan2}>
                <label>Postcode</label>
                <input
                  {...register(`collectionPoints.${i}.postcode`, { required: 'Postcode required' })}
                  placeholder="e.g., BT1 1AA or D02 YF57"
                />
                {errors?.collectionPoints?.[i]?.postcode && (
                  <small className={styles.err}>{errors.collectionPoints[i].postcode.message}</small>
                )}
              </div>
              <div className={styles.colSpan2}>
                <label>Address</label>
                <input
                  {...register(`collectionPoints.${i}.address`, { required: 'Address required' })}
                  placeholder="Street, City, County"
                />
                {errors?.collectionPoints?.[i]?.address && (
                  <small className={styles.err}>{errors.collectionPoints[i].address.message}</small>
                )}
              </div>

              <div>
                <label>Ready From (Date & Time)</label>
                <input type="datetime-local" {...register(`collectionPoints.${i}.readyfrom`)} />
              </div>
              <div>
                <label>Close By (Date & Time)</label>
                <input type="datetime-local" {...register(`collectionPoints.${i}.closeby`)} />
              </div>

              <div className={styles.colSpan2}>
                <label>Notes</label>
                <input {...register(`collectionPoints.${i}.notes`)} placeholder="Any special instructions…" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deliveries */}
      <div className={styles.palletCard}>
        <div className={styles.sectionHeader}>Deliveries</div>
        <div className={styles.toolbar}>
          <button type="button" className={styles.addBtn} onClick={addDelivery}>+ Add Delivery</button>
        </div>

        {delFields.map((f, i) => (
          <div key={f.id} className={styles.card} style={{ marginTop: 10 }}>
            <div className={styles.cardHead}>
              <strong>Delivery #{i + 1}</strong>
              <button type="button" className={styles.removeBtn} onClick={() => removeDel(i)}>✕</button>
            </div>

            <div className={styles.grid}>
              <div>
                <label>Reference</label>
                <input {...register(`deliveryPoints.${i}.ref`)} placeholder="Optional reference" />
              </div>
              <div>
                <label>Contact</label>
                <input {...register(`deliveryPoints.${i}.contact`)} placeholder="Name" />
              </div>
              <div>
                <label>Phone</label>
                <input {...register(`deliveryPoints.${i}.phone`)} placeholder="Phone" />
              </div>
              <div className={styles.colSpan2}>
                <label>Postcode</label>
                <input
                  {...register(`deliveryPoints.${i}.postcode`, { required: 'Postcode required' })}
                  placeholder="e.g., D02 YF57 or BT1 1AA"
                />
                {errors?.deliveryPoints?.[i]?.postcode && (
                  <small className={styles.err}>{errors.deliveryPoints[i].postcode.message}</small>
                )}
              </div>
              <div className={styles.colSpan2}>
                <label>Address</label>
                <input
                  {...register(`deliveryPoints.${i}.address`, { required: 'Address required' })}
                  placeholder="Street, City, County"
                />
                {errors?.deliveryPoints?.[i]?.address && (
                  <small className={styles.err}>{errors.deliveryPoints[i].address.message}</small>
                )}
              </div>

              <div>
                <label>Earliest (Date & Time)</label>
                <input type="datetime-local" {...register(`deliveryPoints.${i}.earliest`)} />
              </div>
              <div>
                <label>Latest (Date & Time)</label>
                <input type="datetime-local" {...register(`deliveryPoints.${i}.latest`)} />
              </div>

              <div className={styles.colSpan2}>
                <label>Notes</label>
                <input {...register(`deliveryPoints.${i}.notes`)} placeholder="Any special instructions…" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
