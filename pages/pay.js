// pages/pay.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Pay() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!mounted || !router.isReady) return;

      const { id } = router.query;
      if (!id) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
      } else {
        setBooking(data);
      }
    };

    fetchBooking();
  }, [router, mounted]);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '2rem' }}>
        Loading payment page...
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '2rem' }}>
        Loading booking information...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Booking Payment | Midnight Express</title>
      </Head>

      <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '3rem' }}>
        <h1 className="mb-4">Booking Payment</h1>

        <p><strong>Booking ID:</strong> {booking.id}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>ADR Required:</strong> {booking.adr ? 'Yes' : 'No'}</p>
        <p><strong>Pallet Count:</strong> {booking.pallets?.length || 0}</p>
        <p><strong>Total:</strong> £{booking.amount}</p>
        <p><strong>Currency:</strong> {booking.currency?.toUpperCase()}</p>

        <hr style={{ borderColor: '#666' }} />

        <p>This is a summary view only. Payment logic (e.g., Stripe integration) can be added here once routes are confirmed stable.</p>
      </div>
    </>
  );
}
