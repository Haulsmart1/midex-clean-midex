// components/common/CustomsUpload.jsx
'use client';

import React, { useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { uploadFile, deleteFile } from '@/utils/uploadHelper';
import styles from '@/styles/CustomsUpload.module.css';

// small helpers
const fmtBytes = (n = 0) => {
  if (!n || isNaN(n)) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
};
const isImg = (name = '') => /\.(png|jpe?g|gif|webp)$/i.test(name);

export default function CustomsUpload({
  bookingId,
  field,              // 'invoice' | 'packing' | 'delivery' | …
  value,              // single: {name,url,path}?  multiple: [{…}]
  setValue,           // setter provided by parent (updates RHF form)
  multiple = false,   // true => array mode
}) {
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const currentFiles = multiple ? (value || []) : (value ? [value] : []);
  const canUpload = !!bookingId && !!supabase;

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !canUpload) return;

    setBusy(true);
    let list = multiple ? [...currentFiles] : [];

    for (const f of files) {
      try {
        // simple progress feel
        setProgress(30);
        const fileObj = await uploadFile(
          supabase,
          bookingId,
          'files',
          f,
          `customs/${field}`
        );
        // store size & type for nicer list (optional)
        fileObj.size = f.size;
        fileObj.type = f.type;

        if (multiple) {
          list.push(fileObj);
        } else {
          list = [fileObj]; // replace in single mode
        }
        setProgress(90);
      } catch (err) {
        console.error('[Upload] failed:', err);
      } finally {
        setProgress(100);
        setTimeout(() => setProgress(0), 700);
      }
    }

    setValue(multiple ? list : list[0] || null);
    setBusy(false);
  };

  const onDelete = async (fileObj) => {
    if (!fileObj?.path) {
      // local-only item? just pop from UI
      setValue(
        multiple ? currentFiles.filter((f) => f !== fileObj) : null
      );
      return;
    }
    try {
      setBusy(true);
      await deleteFile(supabase, 'files', fileObj.path);
      setValue(
        multiple ? currentFiles.filter((f) => f.path !== fileObj.path) : null
      );
    } catch (err) {
      console.error('[Delete] failed:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.neonUploadWrapper}>
      {/* Hidden input */}
      <input
        id={`cu-${field}`}
        type="file"
        hidden
        multiple={multiple}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        onChange={onPick}
      />

      {/* Trigger */}
      <label
        htmlFor={`cu-${field}`}
        className={styles.neonUploadBtn}
        aria-disabled={!canUpload || busy}
      >
        {currentFiles.length
          ? multiple ? '➕ Add File(s)' : '↻ Replace File'
          : '➕ Upload File'}
      </label>

      {/* Progress bar */}
      {progress > 0 && (
        <div className={styles.uploadBarWrapper}>
          <div className={styles.uploadBar} style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* File list */}
      {currentFiles.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
          {currentFiles.map((f, i) => (
            <li
              key={f.path || f.url || `${f.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                border: '1px solid #20324d',
                borderRadius: 10,
                background: '#0b111b',
                marginBottom: 8,
              }}
            >
              {/* thumbnail (images only) */}
              {isImg(f.name || '') ? (
                <img
                  src={f.url}
                  alt={f.name}
                  style={{ width: 34, height: 34, objectFit: 'cover', borderRadius: 6 }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    background: '#132034',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#9bd',
                    fontSize: 14,
                  }}
                  title="Document"
                >
                  📄
                </div>
              )}

              {/* name + size */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: '#eaf6ff',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={f.name}
                >
                  {f.name}
                </div>
                <div style={{ color: '#9bb6d1', fontSize: 12 }}>
                  {fmtBytes(f.size)}
                </div>
              </div>

              {/* actions */}
              <a
                href={f.url}
                download={f.name || true}
                target="_blank"
                rel="noreferrer"
                className={styles.btnGhost}
                style={{ textDecoration: 'none' }}
              >
                ⬇️ Download
              </a>

              <button
                type="button"
                onClick={() => onDelete(f)}
                className={styles.neonDangerBtn}
                disabled={busy}
                title="Remove file"
              >
                ❌ Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {!canUpload && (
        <div style={{ color: '#ffb4b4', marginTop: 6, fontSize: 13 }}>
          Upload disabled: missing bookingId or Supabase client.
        </div>
      )}
    </div>
  );
}
