// pages/dashboard/admin/bookings/[id].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '@/components/layouts/AdminLayout';

export default function BookingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, pallets, created_at, users(company_name), forwarders(name)')
        .eq('id', id)
        .single();

      if (!error) {
        setBooking(data);
      }

      setLoading(false);
    };

    fetchBooking();
  }, [id]);

  if (loading) return <p className="text-muted">Loading...</p>;
  if (!booking) return <p className="text-danger">Booking not found.</p>;

  return (
    <>
      <Head>
        <title>Booking Details | Admin | Midnight Express</title>
      </Head>

      <h1 className="display-6 mb-4">Booking #{booking.id.slice(0, 8)}…</h1>
      <p className="text-muted">Detailed view of the selected booking.</p>

      <table className="table table-bordered text-light mt-4">
        <tbody>
          <tr>
            <th>Status</th>
            <td>{booking.status}</td>
          </tr>
          <tr>
            <th>Company</th>
            <td>{booking.users?.company_name || 'N/A'}</td>
          </tr>
          <tr>
            <th>Forwarder</th>
            <td>{booking.forwarders?.name || 'Unassigned'}</td>
          </tr>
          <tr>
            <th>Pallets</th>
            <td>{Array.isArray(booking.pallets) ? booking.pallets.length : '-'}</td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{new Date(booking.created_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

BookingDetails.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
