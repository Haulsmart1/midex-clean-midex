'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import UsersLayout from '@/components/layouts/UsersLayout';

export default function UserBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : [session?.user?.role].filter(Boolean);

  const accountType =
    session?.user?.account_type ||
    session?.user?.accountType ||
    (session?.user?.is_credit ? 'credit' : 'cash') ||
    'n/a';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/login');
    } else if (!roles.includes('user')) {
      router.replace('/dashboard');
    }
  }, [session, status, router, roles]);

  useEffect(() => {
    if (!session?.user?.id) return;

    let isMounted = true;

    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/bookings?user_id=${session.user.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (isMounted) {
          console.error('[Bookings fetch error]', e);
          setError('Failed to fetch bookings.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  if (status === 'loading' || !session) return <div>Loading...</div>;
  if (!roles.includes('user')) return <div>Redirecting...</div>;

  return (
    <UsersLayout>
      <Head>
        <title>📦 My Bookings | Midnight Express</title>
      </Head>
      <div className="container py-5 text-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">📦 My Bookings</h2>
          <Link href="/dashboard/freight-desk" className="btn btn-outline-info">Freight desk demo</Link>
          <Link href="/dashboard/user/bookings/create" className="btn btn-success">
            ➕ New Booking
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="alert alert-info">No bookings yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-striped align-middle">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/dashboard/user/bookings/${b.id}`} className="fw-bold text-info">
                        {b.reference || b.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`badge bg-${
                          b.status === 'paid'
                            ? 'success'
                            : b.status === 'pending'
                            ? 'warning'
                            : 'secondary'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                    <td>{accountType.toUpperCase()}</td>
                    <td>£{(b.amount / 100).toFixed(2)}</td>
                    <td>
                      {accountType === 'cash' && b.status !== 'paid' ? (
                        <Link
                          href={`/dashboard/user/pay?bookingId=${b.id}`}
                          className="btn btn-sm btn-warning"
                        >
                          Pay Now
                        </Link>
                      ) : b.status === 'paid' ? (
                        <span className="text-success fw-bold">Paid</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/user/bookings/${b.id}`}
                        className="btn btn-sm btn-outline-info"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UsersLayout>
  );
}
