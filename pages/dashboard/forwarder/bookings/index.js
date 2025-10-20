'use client';

import Head from 'next/head';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/styles/ForwarderDashboard.module.css';

// Map statuses to % progress
const statusProgressMap = {
  draft: 10,
  pending_payment: 30,
  pending_approval: 40,
  delivered: 80,
  signed_off: 100,
};

async function getForwarderTableIdBySessionUser(sessionUser) {
  if (!sessionUser?.id && !sessionUser?.email) {
    throw new Error("Missing session user information.");
  }

  if (sessionUser?.id) {
    const { data } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', sessionUser.id)
      .maybeSingle();
    if (data && data.role === 'forwarder') return data.id;
  }

  if (sessionUser?.email) {
    const { data } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', sessionUser.email.toLowerCase())
      .maybeSingle();
    if (data && data.role === 'forwarder') return data.id;
  }

  throw new Error('You do not have forwarder access.');
}

export default function ForwarderBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [notForwarder, setNotForwarder] = useState(false);
  const podInputs = useRef({});

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const roles = session.user.roles || [session.user.role] || [];
    if (!roles.includes('forwarder')) {
      setNotForwarder(true);
    }
  }, [session, status]);

  useEffect(() => {
    if (!session?.user || notForwarder) return;

    async function fetchBookings() {
      setLoading(true);
      setError(null);

      try {
        const userId = await getForwarderTableIdBySessionUser(session.user);

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBookings(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load bookings.');
      }

      setLoading(false);
    }

    fetchBookings();
  }, [session, notForwarder]);

  async function handleSignOff(booking) {
    if (!booking?.id || processingId) return;
    setProcessingId(booking.id);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'signed_off' })
        .eq('id', booking.id);

      if (error) throw error;

      toast.success('✅ Booking signed off!');
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: 'signed_off' } : b
        )
      );
    } catch (err) {
      toast.error('❌ ' + err.message);
    }
    setProcessingId(null);
  }

  // === NEW: Create Invoice handler ===
  async function handleCreateInvoice(booking) {
    if (!booking?.id || processingId) return;
    setProcessingId(booking.id);

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([
          {
            booking_id: booking.id,
            user_id: booking.user_id,
            amount: booking.total_cost,
            status: 'unpaid',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('✅ Invoice created!');
      console.log('Invoice:', data);

      // Mark booking as invoiced (optional)
      await supabase
        .from('bookings')
        .update({ invoiced: true })
        .eq('id', booking.id);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, invoiced: true } : b
        )
      );
    } catch (err) {
      toast.error('❌ Failed to create invoice: ' + err.message);
    }
    setProcessingId(null);
  }

  async function handlePodUpload(booking, e) {
    const file = e.target.files[0];
    if (!file || !booking?.id) return;

    const fileName = `${booking.id}/pod_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("pods")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      return toast.error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase
      .storage
      .from("pods")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) return toast.error("No public URL returned");

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ docs_uploaded: true, pod_url: publicUrl })
      .eq("id", booking.id);

    if (updateError) return toast.error(updateError.message);

    if (booking.pod_url) {
      toast.info("🔄 POD updated!");
    } else {
      toast.success("✅ POD uploaded!");
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, docs_uploaded: true, pod_url: publicUrl } : b
      )
    );
  }

  async function handleMarkDelivered(booking) {
    if (!booking?.id) return;
    setProcessingId(booking.id);

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'delivered' })
      .eq('id', booking.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Marked as delivered');
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: 'delivered' } : b
        )
      );
    }
    setProcessingId(null);
  }

  async function handleDeleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    setProcessingId(bookingId);
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      toast.success('🗑️ Booking deleted successfully!');
    } catch (err) {
      toast.error('❌ Failed to delete: ' + err.message);
    }
    setProcessingId(null);
  }

  if (notForwarder) {
    return (
      <ForwarderLayout>
        <div className="container py-4 text-white">
          <div className="alert alert-danger mt-4">
            You do not have forwarder access. Please contact support.
          </div>
        </div>
      </ForwarderLayout>
    );
  }

  return (
    <ForwarderLayout>
      <Head>
        <title>📦 My Bookings | Forwarder</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className={styles.dashboardTitle}>📦 Forwarder Bookings</h1>

        <Link href="/dashboard/forwarder/bookings/create" className="btn btn-primary mb-4">
          ➕ Create New Booking
        </Link>

        {status === 'loading' && <p>Checking session...</p>}
        {loading && <p>Loading bookings...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && bookings.length === 0 && <p>No bookings found for your ID.</p>}

        <div className="row">
          {bookings.map((booking) => {
            const progress = statusProgressMap[booking.status] || 20;

            return (
              <div key={booking.id} className="col-md-6 mb-4">
                <div className="card bg-dark text-light shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">📦 Booking #{booking.id}</h5>
                    <p>Status: <b>{booking.status}</b></p>

                    {/* Progress Bar */}
                    <div className="progress mb-3" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>

                    {/* POD Upload */}
                    <div style={{ marginTop: "1rem" }}>
                      <label htmlFor={`pod-upload-${booking.id}`} style={{ cursor: "pointer", color: "#0af" }}>
                        <input
                          type="file"
                          id={`pod-upload-${booking.id}`}
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: "none" }}
                          disabled={processingId === booking.id}
                          onChange={(e) => handlePodUpload(booking, e)}
                        />
                        {booking.pod_url ? "📄 Replace POD File" : "📤 Upload Proof of Delivery"}
                      </label>

                      <div style={{ fontSize: 13, marginTop: 4 }}>
                        {booking.pod_url ? (
                          <a href={booking.pod_url} target="_blank" rel="noreferrer" style={{ color: "#0af" }}>
                            ✅ View POD
                          </a>
                        ) : (
                          <span style={{ color: "#aaa" }}>No POD uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 d-flex" style={{ gap: "10px" }}>
                      <Link href={`/dashboard/forwarder/bookings/${booking.id}/edit`} className="btn btn-info btn-sm">
                        ✏️ Edit
                      </Link>
                      <button className="btn btn-success btn-sm" disabled={processingId === booking.id} onClick={() => handleMarkDelivered(booking)}>
                        Mark Delivered
                      </button>
                      {booking.status !== 'signed_off' ? (
                        <button className="btn btn-warning btn-sm" disabled={processingId === booking.id} onClick={() => handleSignOff(booking)}>
                          Sign Off
                        </button>
                      ) : (
                        !booking.invoiced && (
                          <button className="btn btn-primary btn-sm" disabled={processingId === booking.id} onClick={() => handleCreateInvoice(booking)}>
                            💰 Create Invoice
                          </button>
                        )
                      )}
                      <button className="btn btn-danger btn-sm" disabled={processingId === booking.id} onClick={() => handleDeleteBooking(booking.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ToastContainer position="bottom-left" />
      </div>
    </ForwarderLayout>
  );
}


