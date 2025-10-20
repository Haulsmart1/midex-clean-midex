'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import { safeUploadFile, deleteFile } from '@/utils/uploadHelper';
import TomTomAutocompleteInput from '@/utils/TomTomInputStandalone';
import styles from '@/styles/CreateCurrysBooking.module.css';

export default function EditCurrysBooking() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState([]);
  const [previewPath, setPreviewPath] = useState(null);
  const [signedPreviewUrl, setSignedPreviewUrl] = useState(null);
  const fileInputRef = useRef();

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    const allowed = ['currys', 'currys_admin'];
    if (!session || !allowed.includes(session.user?.partner_type)) {
      setUnauthorized(true);
    }
  }, [session, status]);

  // Load booking data
  useEffect(() => {
    if (!id || status !== 'authenticated') return;
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings_currys')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setForm(data);
      setLoading(false);
    };
    fetchBooking();
  }, [id, status]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDeleteFile = async (path) => {
    try {
      await deleteFile(supabase, 'files', path);
      const updated = (form.file_urls || []).filter((p) => p !== path);
      await supabase.from('bookings_currys').update({ file_urls: updated }).eq('id', id);
      setForm((f) => ({ ...f, file_urls: updated }));
    } catch {
      alert('❌ Could not delete file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (unauthorized || !id) return;

    const uploadedPaths = [];
    for (const file of files) {
      try {
        const result = await safeUploadFile(supabase, id, file, 'uploads');
        uploadedPaths.push(result.path);
      } catch {
        alert('❌ Upload failed');
        return;
      }
    }

    const existing = Array.isArray(form.file_urls) ? form.file_urls : [];
    const finalPaths = [...existing, ...uploadedPaths];

    const { error } = await supabase
      .from('bookings_currys')
      .update({ ...form, file_urls: finalPaths })
      .eq('id', id);

    if (error) {
      alert('❌ Update failed');
      return;
    }

    alert('✅ Booking updated!');
    router.push('/dashboard/currys/bookings');
  };

  // Signed preview URL
  useEffect(() => {
    if (!previewPath) return;
    const generateSignedUrl = async () => {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(previewPath, 60 * 5);

      if (!error && data?.signedUrl) {
        setSignedPreviewUrl(data.signedUrl);
      } else {
        setSignedPreviewUrl(null);
      }
    };
    generateSignedUrl();
  }, [previewPath]);

  if (status === 'loading' || loading) return <div>Loading...</div>;
  if (unauthorized) return <div>🔒 Not authorised</div>;

  const getIcon = (name) =>
    /\.(jpg|jpeg|png|gif)$/i.test(name) ? '🖼️' : /\.pdf$/i.test(name) ? '📄' : '📁';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.topActions}>
          <button onClick={() => router.push('/dashboard/currys/bookings')} className={styles.backButton}>
            ← Back
          </button>
          <button onClick={() => signOut()} className={styles.logoutButton}>
            Logout
          </button>
        </div>

        <h2 className={styles.title}>Edit Booking</h2>

        {signedPreviewUrl && (
          <div className={styles.modalOverlay} onClick={() => setPreviewPath(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeModal} onClick={() => setPreviewPath(null)}>✖</button>
              {previewPath?.endsWith('.pdf') ? (
                <iframe src={signedPreviewUrl} title="Preview" />
              ) : (
                <img src={signedPreviewUrl} alt="Preview" />
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {renderField('Internal Ref', 'internal_ref', form, handleChange)}
          {renderField('Battery Type', 'battery_type', form, handleChange)}
          {renderField('Quantity', 'quantity', form, handleChange, 'number')}
          {renderField('Triage Action', 'triage_action', form, handleChange)}
          {renderField('Status', 'status', form, handleChange)}
          {renderField('Notes', 'notes', form, handleChange)}
          {renderField('Customer Name', 'customer_name', form, handleChange)}

          <TomTomAutocompleteInput
            name="address"
            value={{
              address: form.address,
              postcode: form.postcode,
              lat: form.lat,
              lon: form.lon,
            }}
            onChange={(val) => {
              setForm((f) => ({
                ...f,
                address: val.address,
                postcode: val.postcode,
                lat: val.lat,
                lon: val.lon,
              }));
            }}
          />

          {renderField('Postcode', 'postcode', form, handleChange)}
          {renderField('Country', 'country', form, handleChange)}
          {renderField('Email', 'email', form, handleChange)}
          {renderField('Mobile', 'mobile', form, handleChange)}
          {renderField('Battery Serial', 'battery_serial', form, handleChange)}
          {renderField('Pets', 'pets', form, handleChange)}
          {renderField('Parking', 'parking', form, handleChange)}
          {renderField('Collection Date', 'collection_date', form, handleChange, 'date')}
          {renderField('Accessibility', 'accessibility_issues', form, handleChange)}
          {renderField('Health & Safety', 'health_safety_issues', form, handleChange)}

          <div className={styles.dropArea} onDrop={handleDrop} onDragOver={handleDragOver}>
            Drag & drop files here or click below
          </div>

          <label htmlFor="file-upload" className={styles.uploadButton}>
            Choose Files
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            className={styles.hiddenFileInput}
          />

          {files.length > 0 && (
            <ul className={styles.fileList}>
              {files.map((file, i) => (
                <li key={i}>• {file.name}</li>
              ))}
            </ul>
          )}

          {form.file_urls?.length > 0 && (
            <>
              <p className={styles.label}>🧾 Existing Files:</p>
              <ul className={styles.fileList}>
                {form.file_urls.map((path, i) => {
                  const name = decodeURIComponent(path.split('/').pop());
                  return (
                    <li key={i}>
                      <span
                        onClick={() => setPreviewPath(path)}
                        className={styles.link}
                        style={{ cursor: 'pointer' }}
                      >
                        {getIcon(name)} {name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(path)}
                        className={styles.deleteButton}
                      >
                        ❌
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            💾 Save Booking
          </button>
        </form>
      </div>
    </div>
  );
}

function renderField(label, name, form, onChange, type = 'text') {
  return (
    <div>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={form[name] || ''}
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
}
