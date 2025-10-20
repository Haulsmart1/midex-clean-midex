// /components/common/AdrUploader.jsx
'use client';

import React, { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { uploadFile, deleteFile } from '@/utils/uploadHelper';
import styles from '@/styles/ConsignmentDetails.module.css';

export default function AdrUploader({ idx, pallets, setValue, bookingId }) {
  const adrState = pallets[idx]?.adrFiles || [];
  const [busy, setBusy] = useState(false);

  const handleUpload = async (files) => {
    if (!bookingId) {
      alert('⚠️ Missing bookingId, cannot upload ADR files.');
      return;
    }
    setBusy(true);

    let uploaded = [...adrState];
    for (const file of files) {
      try {
        const fileObj = await uploadFile(
          supabase,
          bookingId,
          'files',
          file,
          `adr/pallet_${idx}`
        );
        uploaded.push(fileObj);
      } catch (err) {
        console.error('❌ ADR Upload failed:', err);
        alert(`ADR upload failed: ${err.message}`);
      }
    }

    setValue(`pallets.${idx}.adrFiles`, uploaded, { shouldDirty: true });
    setBusy(false);
  };

  const handleDelete = async (fileObj) => {
    if (!fileObj?.path) return;
    setBusy(true);
    try {
      await deleteFile(supabase, 'files', fileObj.path);
      setValue(
        `pallets.${idx}.adrFiles`,
        adrState.filter((f) => f.path !== fileObj.path),
        { shouldDirty: true }
      );
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.neonUploadWrapper}>
      <input
        id={`adrUpload-${idx}`}
        type="file"
        multiple
        disabled={busy}
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) handleUpload(files);
          e.target.value = '';
        }}
      />
      <label htmlFor={`adrUpload-${idx}`} className={styles.neonUploadBtn} aria-disabled={busy}>
        + Upload ADR File(s)
      </label>

      {adrState.length > 0 && (
        <ul style={{ marginTop: 10 }}>
          {adrState.map((f, i) => (
            <li key={i}>
              <a href={f.url} target="_blank" rel="noreferrer">
                📄 {f.name}
              </a>
              <button
                type="button"
                onClick={() => handleDelete(f)}
                className={styles.neonDangerBtn}
                style={{ marginLeft: 10 }}
              >
                ❌ Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
