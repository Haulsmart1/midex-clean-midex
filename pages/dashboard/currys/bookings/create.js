'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/styles/CreateCurrysBooking.module.css';
import TomTomAutocompleteInput from '@/utils/TomTomAutocompleteInput';

export default function CreateCurrysBooking() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { control, handleSubmit } = useForm();

  const [unauthorized, setUnauthorized] = useState(false);
  const [file, setFile] = useState(null);
  const [useManualAddress, setUseManualAddress] = useState(false);

  const [manualAddress, setManualAddress] = useState('');
  const [manualPostcode, setManualPostcode] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    const allowedPartners = ['currys', 'currys_admin'];
    const partnerType = session?.user?.partner_type;

    console.log('👤 Partner Type:', partnerType);
    console.log('🧪 Full Session:', session);

    if (!session || !allowedPartners.includes(partnerType)) {
      setUnauthorized(true);
    }
  }, [session, status]);

  const onSubmit = async (data) => {
    if (unauthorized) return;

    const customId = crypto.randomUUID();

    let filePath = null;
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error } = await supabase.storage
        .from('currysdocs')
        .upload(fileName, file);

      if (error) {
        alert('❌ Upload failed');
        return console.error(error);
      }

      const { data: publicUrlData } = supabase.storage
        .from('currysdocs')
        .getPublicUrl(uploadData.path);

      filePath = publicUrlData?.publicUrl || null;
    }

    const addressData = useManualAddress
      ? {
          address: manualAddress,
          postcode: manualPostcode,
          lat: manualLat,
          lon: manualLon,
        }
      : {
          address: data?.address?.address || '',
          postcode: data?.address?.postcode || '',
          lat: data?.address?.lat || null,
          lon: data?.address?.lon || null,
        };

    const { error } = await supabase.from('bookings_currys').insert([
      {
        id: customId,
        internal_ref: data.ref,
        battery_type: data.batteryType,
        quantity: parseInt(data.quantity, 10),
        triage_action: data.triageAction,
        status: data.statusVal,
        notes: data.notes,
        file_url: filePath,
        created_by: session.user.email,
        customer_name: data.customerName,
        address: addressData.address,
        postcode: addressData.postcode,
        lat: addressData.lat,
        lon: addressData.lon,
        country: data.country,
        email: data.email,
        mobile: data.mobile,
        battery_serial: data.batterySerial,
        pets: data.pets,
        parking: data.parking,
        collection_date: data.collectionDate || null,
        accessibility_issues: data.accessibility,
        health_safety_issues: data.safety,
      },
    ]);

    if (error) {
      alert('❌ Submission failed');
      return console.error(error);
    }

    alert('✅ Booking submitted!');
    router.push(`/dashboard/currys/bookings/${customId}`);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.topActions}>
          <button onClick={() => router.push('/dashboard/currys/bookings')} className={styles.backButton}>
            ← Back to Bookings
          </button>
          <button onClick={() => signOut()} className={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>

        <h2 className={styles.title}>Create New Currys Battery Booking</h2>

        {unauthorized && (
          <div className={styles.unauthorized}>
            ❌ Not authorised for Currys portal
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {renderField('Internal Reference *', 'ref', control)}
          {renderField('Battery Type *', 'batteryType', control)}
          {renderField('Quantity *', 'quantity', control, 'number')}
          {renderSelect('Triage Action *', 'triageAction', control, [
            'Collect & Return to Newark',
            'Dispose Only',
            'Test & Hold',
          ])}
          {renderField('Status', 'statusVal', control)}
          {renderTextarea('Notes / Extra Info', 'notes', control)}
          {renderField('Customer Name', 'customerName', control)}

          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setUseManualAddress(!useManualAddress)}
              className={styles.toggleButton}
            >
              {useManualAddress ? '🔍 Use Autocomplete' : '✍️ Enter Address Manually'}
            </button>
          </div>

          {useManualAddress ? (
            <>
              {renderManualInput('Address', manualAddress, setManualAddress)}
              {renderManualInput('Postcode', manualPostcode, setManualPostcode)}
              {renderManualInput('Latitude', manualLat, setManualLat)}
              {renderManualInput('Longitude', manualLon, setManualLon)}
            </>
          ) : (
            <TomTomAutocompleteInput name="address" control={control} />
          )}

          {renderField('Country', 'country', control)}
          {renderField('Email', 'email', control)}
          {renderField('Mobile Number', 'mobile', control)}
          {renderField('Battery Serial Number', 'batterySerial', control)}
          {renderTextarea('Pets', 'pets', control)}
          {renderTextarea('Parking Issues', 'parking', control)}
          {renderField('Collection Date', 'collectionDate', control, 'date')}
          {renderTextarea('Accessibility Issues', 'accessibility', control)}
          {renderTextarea('Health & Safety Notes', 'safety', control)}

          <div className={styles.fileUploadWrapper}>
            <label className={styles.label}>Attach Document / Image</label>
            <label htmlFor="file-upload" className={styles.uploadButton}>
              📎 Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />
            {file && <p className={styles.fileName}>Selected: {file.name}</p>}
          </div>

          <button type="submit" disabled={unauthorized} className={styles.submitButton}>
            ✅ Create Booking
          </button>
        </form>
      </div>
    </div>
  );
}

// === Helpers ===

function renderField(label, name, control, type = 'text') {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <div>
          <label className={styles.label}>{label}</label>
          <input {...field} type={type} className={styles.input} required={label.includes('*')} />
        </div>
      )}
    />
  );
}

function renderTextarea(label, name, control) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <div>
          <label className={styles.label}>{label}</label>
          <textarea {...field} className={styles.textarea} rows={3} />
        </div>
      )}
    />
  );
}

function renderSelect(label, name, control, options) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={options[0]}
      render={({ field }) => (
        <div>
          <label className={styles.label}>{label}</label>
          <select {...field} className={styles.select}>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    />
  );
}

function renderManualInput(label, value, setter) {
  return (
    <div>
      <label className={styles.label}>{label}</label>
      <input type="text" value={value} onChange={(e) => setter(e.target.value)} className={styles.input} />
    </div>
  );
}
