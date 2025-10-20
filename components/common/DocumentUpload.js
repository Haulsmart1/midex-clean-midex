// /components/common/DocumentUpload.jsx
'use client';

import React, { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { uploadFile, deleteFile } from '@/utils/uploadHelper';
import styles from '@/styles/ConsignmentDetails.module.css';

export default function DocumentUpload({ bookingId, value = [], setValue }) {
  const [busy, setBusy] = useState(false);

  const handleUpload = async (files) => {
    if (!bookingId) {
      alert('⚠️ Missing bookingId, cannot upload documents.');
      return;
    }
    setBusy(true);

    let uploaded = [...value];
    for (const file of files) {
      try {
        const fileObj = await uploadFile(supabase, bookingId, 'files', file, 'documents');
        uploaded.push(fileObj);
      } catch (err) {
        console.error('❌ Upload failed:', err);
        alert(`Upload failed: ${err.message}`);
      }
    }

    setValue(uploaded);
    setBusy(false);
  };

  const handleDelete = async (fileObj) => {
    if (!fileObj?.path) return;
    setBusy(true);
    try {
      await deleteFile(supabase, 'files', fileObj.path);
      setValue(value.filter((f) => f.path !== fileObj.path));
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
        type="file"
        id="docUpload"
        multiple
        disabled={busy}
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) handleUpload(files);
          e.target.value = '';
        }}
      />
      <label htmlFor="docUpload" className={styles.neonUploadBtn} aria-disabled={busy}>
        + Upload Delivery Note(s)
      </label>

      {value.length > 0 && (
        <ul style={{ marginTop: 10 }}>
          {value.map((f, i) => (
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
