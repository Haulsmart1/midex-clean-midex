'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { normalizePostcode, getRegion } from '@/utils/regionDetect';
import { createInvoiceForBooking } from '@/utils/createInvoice';
import { createCustomerInvoiceForBooking } from '@/utils/createCustomerInvoiceForBooking';
import { safeUploadFile } from '@/utils/uploadHelper';

const tabs = ['Internal Bookings', 'Cross-Border Bookings', 'Currys', 'Car Batteries', 'Luminescence'];

const StyledFileInput = ({ label, accept, multiple, onChange, disabled }) => {
  const id = `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div style={{ marginTop: 12 }}>
      <label htmlFor={id} onClick={(e) => e.stopPropagation()} style={{
        display: 'inline-block',
        background: disabled ? '#999' : '#1a73e8',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>{label}</label>
      <input id={id} type="file" accept={accept} multiple={multiple} disabled={disabled}
        onClick={(e) => e.stopPropagation()} onChange={onChange} style={{ display: 'none' }} />
    </div>
  );
};

export default function PartnerBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [partnerSlug, setPartnerSlug] = useState('');
  const [config, setConfig] = useState(null);
  const [internalBookings, setInternalBookings] = useState([]);
  const [crossBorderBookings, setCrossBorderBookings] = useState([]);
  const [currysBookings, setCurrysBookings] = useState([]);
  const [carBatteries, setCarBatteries] = useState([]);
  const [luminescence, setLuminescence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Internal Bookings');
  const [expandedId, setExpandedId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    if (router.query.partner) {
      setPartnerSlug(router.query.partner.toLowerCase());
    }
  }, [router.query.partner]);

  useEffect(() => {
    if (!partnerSlug) return;
    import(`@/components/partners/${partnerSlug}Config`)
      .then((mod) => setConfig(mod.default))
      .catch(() => setConfig({ name: 'Partner', primaryColor: '#66e3e8', coverageAreas: [] }));
  }, [partnerSlug]);

  useEffect(() => {
    if (status === 'loading' || !partnerSlug || !config) return;
    if (!session) return router.replace('/login');

    const roles = Array.isArray(session?.user?.roles)
      ? session.user.roles.map((r) => r?.toLowerCase())
      : [session?.user?.role?.toLowerCase()].filter(Boolean);
    const partnerType = session?.user?.partner_type?.toLowerCase();

    if (!roles.includes('partner') || partnerType !== partnerSlug) {
      return router.replace('/dashboard');
    }

    fetchBookings();
  }, [session, status, partnerSlug, config]);

  const parseJSON = (input) => {
    if (!input) return [];
    if (typeof input === 'object') return input;
    try {
      return JSON.parse(input);
    } catch {
      return [];
    }
  };

  const fetchBookings = async () => {
    const { data: baseBookings, error } = await supabase.from('bookings').select('*');
    if (error) return console.error('❌ Fetch error:', error);

    const { data: currys } = await supabase.from('bookings_currys').select('*');
    const { data: cars } = await supabase.from('bookings_car_batteries').select('*');
    const { data: lumi } = await supabase.from('bookings_luminescence').select('*');

    const internal = [];
    const crossBorder = [];

    (baseBookings || []).forEach((b) => {
      if (b.status === 'completed') return;

      const col = parseJSON(b.collectionpoints)?.[0] || {};
      const del = parseJSON(b.deliverypoints)?.[0] || {};
      const origin = normalizePostcode(col.postcode || '');
      const destination = normalizePostcode(del.postcode || '');

      const originRegion = getRegion(origin);
      const destinationRegion = getRegion(destination);
      const isCrossBorder = originRegion !== destinationRegion;

      const booking = { ...b, col, del, origin, destination };

      if (!isCrossBorder && config.coverageAreas.some(prefix => origin.startsWith(prefix))) {
        internal.push(booking);
      }

      if (isCrossBorder && config.coverageAreas.some(prefix => destination.startsWith(prefix))) {
        crossBorder.push(booking);
      }
    });

    const formatFlatBooking = (b) => ({
      ...b,
      col: { postcode: b.postcode, address: b.address },
      del: { postcode: '', address: '' },
      origin: normalizePostcode(b.postcode || ''),
      destination: '',
    });

    setInternalBookings(internal);
    setCrossBorderBookings(crossBorder);
    setCurrysBookings((currys || []).map(formatFlatBooking));
    setCarBatteries((cars || []).map(formatFlatBooking));
    setLuminescence((lumi || []).map(formatFlatBooking));
    setLoading(false);
  };

  const handlePODUpload = async (bookingId, files) => {
    for (const file of files) {
      try {
        const { url, path } = await safeUploadFile(supabase, bookingId, file, 'pods');
        setUploadedFiles((prev) => ({ ...prev, [file.name]: url }));
        await supabase.from('bookings').update({ pod_uploaded: true, pod_url: path }).eq('id', bookingId);
        fetchBookings();
      } catch (error) {
        alert(`❌ Failed to upload ${file.name}`);
        console.error(error);
      }
    }
  };

  const handlePhotoUpload = async (bookingId, files) => {
    for (const file of files) {
      try {
        const { url } = await safeUploadFile(supabase, bookingId, file, 'photos');
        setUploadedFiles((prev) => ({ ...prev, [file.name]: url }));
        alert(`✅ Uploaded: ${file.name}`);
      } catch (error) {
        alert(`❌ Failed to upload ${file.name}`);
        console.error(error);
      }
    }
  };

  const markAsDelivered = async (booking) => {
    const { id } = booking;
    const { error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', id);
    if (error) return;
    await createInvoiceForBooking(booking, session.user.id);
    await createCustomerInvoiceForBooking(booking);
    fetchBookings();
  };

  const allocateToHaulsmart = async (bookingId) => {
    alert('External allocation is disabled. Explore simulated quotes in the local freight desk at /dashboard/freight-desk.');
  };

  const pill = (txt) => (
    <span style={{
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: 6,
      fontSize: 14,
      background: '#29486b',
      marginTop: 6,
      color: '#fff'
    }}>{txt}</span>
  );

  const renderCard = (b) => {
    const isExpanded = expandedId === b.id;
    const isLocked = b.allocated_to === 'haulsmart';

    return (
      <div key={b.id} onClick={() => !isLocked && setExpandedId(isExpanded ? null : b.id)}
        style={{
          background: '#1a2a3d',
          padding: 20,
          borderRadius: 10,
          border: `2px solid ${config.primaryColor}`,
          marginBottom: 20,
          cursor: isLocked ? 'not-allowed' : 'pointer'
        }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <strong style={{ color: '#ffc600' }}>📦 Collection</strong>
            <div>{pill(b.col.postcode || b.origin || '—')}</div>
            <div style={{ fontSize: 13 }}>{b.col.address || 'No address'}</div>
          </div>
          <div>
            <strong style={{ color: '#66e3e8' }}>🚚 Delivery</strong>
            <div>{pill(b.del.postcode || b.destination || '—')}</div>
            <div style={{ fontSize: 13 }}>{b.del.address || 'No address'}</div>
          </div>
          <div>
            <strong style={{ color: '#ff77cc' }}>📍 Region</strong>
            <div>{pill(getRegion(b.destination || b.del.postcode || ''))}</div>
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: 16, background: '#0c1628', padding: 16, borderRadius: 8 }}>
            <p><strong>Collection Name:</strong> {b.col.contact || b.col.contact_name || 'N/A'}</p>
            <p><strong>Phone:</strong> {b.col.phone || b.col.contact_phone || 'N/A'}</p>
            <p><strong>Notes:</strong> {b.col.notes || 'None'}</p>
            <p><strong>Ready From:</strong> {b.col.readyfrom || '—'} <strong>Close By:</strong> {b.col.closeby || '—'}</p>
            <hr style={{ margin: '12px 0', borderColor: '#333' }} />
            <p><strong>Delivery Name:</strong> {b.del.contact || b.del.contact_name || 'N/A'}</p>
            <p><strong>Phone:</strong> {b.del.phone || b.del.contact_phone || 'N/A'}</p>
            <p><strong>Notes:</strong> {b.del.notes || 'None'}</p>
            <p><strong>Earliest:</strong> {b.del.earliest || '—'} <strong>Latest:</strong> {b.del.latest || '—'}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <StyledFileInput label="📎 Upload POD" accept="image/*,application/pdf" multiple disabled={isLocked} onChange={(e) => handlePODUpload(b.id, Array.from(e.target.files))} />
              <StyledFileInput label="📸 Upload Photos" accept="image/*,application/pdf" multiple disabled={isLocked} onChange={(e) => handlePhotoUpload(b.id, Array.from(e.target.files))} />
              {!isLocked ? (
                <button onClick={(e) => { e.stopPropagation(); if (confirm('⚠️ Allocate this job to Haulsmart?')) allocateToHaulsmart(b.id); }}
                  style={{ background: '#ffa500', color: '#000', padding: '10px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, marginTop: 12 }}>
                  🚛 Allocate to Haulsmart
                </button>
              ) : (
                <div style={{ background: '#0f0', color: '#000', padding: '10px 16px', borderRadius: 6, fontWeight: 600, marginTop: 12 }}>
                  ✅ Allocated to Haulsmart (Locked)
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); markAsDelivered(b); }} disabled={b.status === 'completed' || isLocked}
                style={{ background: '#00c04b', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: 6, cursor: (b.status === 'completed' || isLocked) ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: (b.status === 'completed' || isLocked) ? 0.5 : 1, marginTop: 12 }}>
                ✅ Mark as Delivered
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const bookingsByTab = {
    'Internal Bookings': internalBookings,
    'Cross-Border Bookings': crossBorderBookings,
    'Currys': currysBookings,
    'Car Batteries': carBatteries,
    'Luminescence': luminescence,
  };

  if (!config || !partnerSlug) return <div style={{ padding: 30 }}>Loading…</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(120deg, #0c1628 60%, ${config.primaryColor} 100%)`,
      color: '#fff',
      fontFamily: 'Poppins, Arial, sans-serif',
      padding: 32,
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>{config.name} Bookings</h1>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: config.primaryColor, color: '#000', padding: '10px 22px', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Log Out</button>
        </div>

        <button onClick={() => router.push('/dashboard')} style={{
          background: '#fff', color: '#000', padding: '8px 16px', borderRadius: 6, fontWeight: 600,
          border: 'none', cursor: 'pointer', marginBottom: 20
        }}>← Back to Dashboard</button>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? '#fff' : '#1a2a3d',
              color: activeTab === tab ? '#000' : '#fff',
              padding: '8px 16px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontWeight: 600
            }}>{tab}</button>
          ))}
        </div>

        {loading ? <p>Loading…</p> : Array.isArray(bookingsByTab[activeTab]) && bookingsByTab[activeTab].length > 0
          ? bookingsByTab[activeTab].map(renderCard)
          : <p>No bookings in this tab.</p>}
      </div>
    </div>
  );
}
