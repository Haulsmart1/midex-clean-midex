import Head from 'next/head';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSupabaseClient } from '@/lib/supabaseClient';

// Util: robust lookup users table ID by session user (id preferred, fallback to email)
async function getForwarderTableIdBySessionUser(sessionUser) {
  const supabase = getSupabaseClient(null);
  // Try by id first
  if (sessionUser?.id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', sessionUser.id)
      .maybeSingle();
    if (data && data.role === 'forwarder') return data.id;
  }
  // Fallback to email if id not found
  if (sessionUser?.email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', sessionUser.email.toLowerCase())
      .maybeSingle();
    if (data && data.role === 'forwarder') return data.id;
  }
  throw new Error("You do not have forwarder access.");
}

export default function ForwarderBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [notForwarder, setNotForwarder] = useState(false);
  const podInputs = useRef({});
  const bookingDocInputs = useRef({});

  // --- RBAC: Only allow "forwarder" role ---
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const roles = session.user.roles || [session.user.role] || [];
    if (!roles.includes('forwarder')) {
      setNotForwarder(true);
      return;
    }
  }, [session, status]);

  // --- Load bookings for forwarder ---
  useEffect(() => {
    if (!session?.user) return;
    if (notForwarder) return;

    async function fetchBookings() {
      setLoading(true);
      setError(null);

      let usersTableId = null;
      try {
        usersTableId = await getForwarderTableIdBySessionUser(session.user);
      } catch (e) {
        setNotForwarder(true);
        setError(e.message || "Access denied.");
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient(session.user.supabaseAccessToken || null);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', usersTableId)
        .order('created_at', { ascending: false });

      setBookings(Array.isArray(data)
        ? data.map((b, i) => ({
            ...b,
            progress: (b.status === 'delivered' || b.status === 'signed_off') ? 100 : (i === 0 ? 70 : 32)
          }))
        : []
      );
      if (error) {
        toast.error('❌ Failed to load bookings.');
        setError('Failed to load bookings: ' + error.message);
      }
      setLoading(false);
    }

    fetchBookings();
  }, [session, notForwarder]);

  // --- Handler: Sign Off ---
  async function handleSignOff(booking) {
    if (processingId) return;
    if (!booking?.id) {
      toast.error("Booking is missing an ID, can't sign off.");
      return;
    }
    setProcessingId(booking.id);

    try {
      const res = await fetch('/api/bookings/sign-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error('❌ ' + (result?.error || 'API error'));
        throw new Error(result?.error || 'API error');
      }

      toast.success('✅ Booking signed off & invoice created!');
      setBookings(prev =>
        prev.map(b =>
          b.id === booking.id ? { ...b, status: 'signed_off' } : b
        )
      );
    } catch (err) {}
    setProcessingId(null);
  }

  // --- Handler: Upload POD ---
  async function handlePodUpload(booking, e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!booking?.id) {
      toast.error("Booking is missing an ID, can't upload POD.");
      e.target.value = '';
      return;
    }
    const supabase = getSupabaseClient(session?.user?.supabaseAccessToken || null);

    const extension = file.name.split('.').pop() || 'pdf';
    const fileName = `pod_${booking.id}_${Date.now()}.${extension}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload POD: ' + (uploadError.message || ''));
      e.target.value = '';
      return;
    }
    if (!uploadData || !uploadData.path) {
      toast.error('Supabase did not return upload data');
      e.target.value = '';
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(uploadData.path);
    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      toast.error('Could not get public URL for POD');
      e.target.value = '';
      return;
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ docs_uploaded: true, pod_url: publicUrl })
      .eq('id', booking.id);

    if (updateError) {
      toast.error('Failed to update booking: ' + (updateError.message || ''));
      e.target.value = '';
      return;
    }

    toast.success('POD uploaded!');
    setBookings(prev =>
      prev.map(b =>
        b.id === booking.id
          ? { ...b, docs_uploaded: true, pod_url: publicUrl }
          : b
      )
    );
    e.target.value = '';
  }

  // --- Handler: Upload Booking Document ---
  async function handleBookingDocUpload(booking, e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!booking?.id) {
      toast.error("Booking is missing an ID, can't upload document.");
      e.target.value = '';
      return;
    }
    const supabase = getSupabaseClient(session?.user?.supabaseAccessToken || null);

    const extension = file.name.split('.').pop() || 'pdf';
    const fileName = `doc_${booking.id}_${Date.now()}.${extension}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload document: ' + (uploadError.message || ''));
      e.target.value = '';
      return;
    }
    if (!uploadData || !uploadData.path) {
      toast.error('Supabase did not return upload data');
      e.target.value = '';
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(uploadData.path);
    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      toast.error('Could not get public URL for document');
      e.target.value = '';
      return;
    }

    toast.success('Booking document uploaded!');
    e.target.value = '';
  }

  // --- Handler: Mark as Delivered ---
  async function handleMarkDelivered(booking) {
    if (!booking?.id) return toast.error("Booking is missing an ID.");
    setProcessingId(booking.id);
    const supabase = getSupabaseClient(session?.user?.supabaseAccessToken || null);

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'delivered', progress: 100 })
      .eq('id', booking.id);

    if (error) {
      toast.error('Failed to mark as delivered: ' + (error.message || ''));
    } else {
      toast.success('Booking marked as delivered!');
      setBookings(prev =>
        prev.map(b =>
          b.id === booking.id ? { ...b, status: 'delivered', progress: 100 } : b
        )
      );
    }
    setProcessingId(null);
  }

  // --- Show not-forwarder warning ---
  if (notForwarder) {
    return (
      <ForwarderLayout>
        <div className="container py-4 text-white">
          <div className="alert alert-danger mt-4" role="alert" aria-live="assertive" aria-atomic="true">
            You do not have forwarder access. Please contact support or log in as a forwarder.
          </div>
        </div>
      </ForwarderLayout>
    );
  }

  // --- Main Render ---
  return (
    <ForwarderLayout>
      <Head>
        <title>📦 My Bookings | Forwarder</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4">📦 Forwarder Bookings</h1>

        <Link href="/dashboard/forwarder/bookings/create" className="btn btn-primary mb-4" aria-label="Create New Booking">
          ➕ Create New Booking
        </Link>

        {status === 'loading' && <p aria-live="polite">⏳ Checking session...</p>}
        {loading && <p aria-live="polite">⏳ Loading bookings...</p>}
        {error && <div className="alert alert-danger" role="alert" aria-live="assertive">{error}</div>}

        {!loading && bookings.length === 0 && (
          <p className="text-muted" aria-live="polite">No bookings found for your ID.</p>
        )}

        {!loading && bookings.length > 0 && (
          <div className="row g-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="col-md-6">
                <div className="booking-card neon-card">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold card-title">
                        🚚 Booking #{booking.id}
                      </span>
                      <span className="date-text">
                        {booking.created_at ? new Date(booking.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="card-content">
                      <div><b>Customer:</b> {booking.customer || 'N/A'}</div>
                      <div><b>Destination:</b> {booking.destination || 'N/A'}</div>
                      <div>
                        <b>Collections:</b> {Array.isArray(booking.collections) && booking.collections.length > 0
                          ? booking.collections.map((p, i) =>
                            <span key={i}>{p.address || p.postcode || JSON.stringify(p)}{i < booking.collections.length - 1 ? ', ' : ''}</span>
                          )
                          : '-'}
                      </div>
                      <div>
                        <b>Deliveries:</b> {Array.isArray(booking.deliveries) && booking.deliveries.length > 0
                          ? booking.deliveries.map((p, i) =>
                            <span key={i}>{p.address || p.postcode || JSON.stringify(p)}{i < booking.deliveries.length - 1 ? ', ' : ''}</span>
                          )
                          : '-'}
                      </div>
                      <div><b>Status:</b> {booking.status || 'N/A'}</div>
                      <div><b>Docs Uploaded:</b> {String(booking.docs_uploaded)}</div>
                      {typeof booking.progress === 'number' && (
                        <div className="my-2">
                          <div style={{ fontSize: 14, marginBottom: 2 }}>Delivery Progress: {booking.progress}%</div>
                          <div className="progress" style={{ height: 14 }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${booking.progress}%`,
                                background: 'linear-gradient(90deg, #01cfff 0%, #695afc 100%)',
                                boxShadow: booking.progress === 100 ? '0 0 8px #15f7e8' : 'none'
                              }}
                              aria-valuenow={booking.progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                      )}
                      {booking.pod_url && (
                        <div className="mt-1">
                          <a href={booking.pod_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0cf", fontSize: 14 }}>
                            View POD
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 card-actions card-actions-row">
                      <Link
                        href={`/dashboard/forwarder/bookings/${booking.id}`}
                        className="btn btn-gradient-primary btn-sm card-action-btn"
                        aria-label={`Edit booking ${booking.id}`}
                      >
                        ✏️ Edit Booking
                      </Link>
                      {booking.status !== 'signed_off' && (
                        <>
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            ref={el => podInputs.current[booking.id] = el}
                            style={{ display: 'none' }}
                            onChange={e => handlePodUpload(booking, e)}
                            aria-label="Upload POD document"
                          />
                          <button
                            className="btn btn-warning card-action-btn"
                            onClick={() => podInputs.current[booking.id].click()}
                            aria-label={booking.docs_uploaded ? 'Replace POD' : 'Upload POD'}
                          >
                            {booking.docs_uploaded ? 'Replace POD' : 'Upload POD'}
                          </button>
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            ref={el => bookingDocInputs.current[booking.id] = el}
                            style={{ display: 'none' }}
                            onChange={e => handleBookingDocUpload(booking, e)}
                            aria-label="Upload booking document"
                          />
                          <button
                            className="btn btn-secondary card-action-btn"
                            onClick={() => bookingDocInputs.current[booking.id].click()}
                            aria-label="Upload booking document"
                          >
                            📄 Booking Document
                          </button>
                        </>
                      )}
                      {booking.status !== 'delivered' && booking.status !== 'signed_off' && (
                        <button
                          className="btn btn-info card-action-btn"
                          onClick={() => handleMarkDelivered(booking)}
                          disabled={processingId === booking.id}
                          aria-label="Mark as Delivered"
                        >
                          🚚 Mark as Delivered
                        </button>
                      )}
                    </div>
                    {booking.status !== 'signed_off' && booking.docs_uploaded && (
                      <div className="signoff-btn-wrapper mt-2">
                        <button
                          onClick={() => handleSignOff(booking)}
                          className="btn btn-success card-action-btn signoff-btn"
                          disabled={processingId === booking.id}
                          aria-label="Sign Off and Create Invoice"
                        >
                          {processingId === booking.id
                            ? 'Processing...'
                            : '✅ Sign Off & Create Invoice'}
                        </button>
                      </div>
                    )}
                    {booking.status !== 'signed_off' && !booking.docs_uploaded && (
                      <div className="signoff-btn-wrapper mt-2">
                        <button className="btn btn-secondary card-action-btn signoff-btn" disabled>
                          Upload docs to enable Sign Off
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ToastContainer position="bottom-left" />
      </div>
      {/* Accessible global CSS left unchanged */}
    </ForwarderLayout>
  );
}
