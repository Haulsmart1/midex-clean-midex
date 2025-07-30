'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';

export default function ForwarderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Ensure role is always an array for checks
  const roles = Array.isArray(session?.user?.roles)
    ? session.user.roles
    : [session?.user?.role].filter(Boolean);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!roles.includes('forwarder')) {
      router.replace('/dashboard');
      return;
    }
  }, [session, status, router, roles]);

  if (status === "loading" || !session) return <div className="mt-4">Loading...</div>;
  if (!roles.includes('forwarder')) return <div className="mt-4">Redirecting...</div>;

  return (
    <ForwarderLayout>
      <Head>
        <title>🚚 Forwarder Dashboard | Midnight Express</title>
      </Head>

      <div className="container py-5 text-light">
        <h1 className="display-5 mb-3">
          🚚 Forwarder Dashboard
        </h1>
        <p className="lead">
          Welcome, {session?.user?.name || 'Forwarder'}!
        </p>
        <p className="text-muted mb-4" style={{ fontSize: 15 }}>
          <span style={{ color: "#fff" }}>Role:</span>
          <span style={{ color: "#aaa", marginLeft: 5 }}>{session?.user?.role || 'n/a'}</span>
          <br />
          <span style={{ color: "#fff" }}>User ID:</span>
          <span
            style={{
              color: "#111",
              background: "#fff",
              borderRadius: 6,
              padding: "2px 10px",
              marginLeft: 8,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 1,
              display: "inline-block"
            }}
          >
            {session?.user?.id || 'n/a'}
          </span>
        </p>

        <div className="row g-4">
          <div className="col-md-6">
            <Link href="/dashboard/forwarder/bookings/create" className="btn btn-success w-100 py-3">
              ➕ Create New Booking
            </Link>
          </div>
          <div className="col-md-6">
            <Link href="/dashboard/forwarder/bookings" className="btn btn-outline-light w-100 py-3">
              📦 View My Bookings
            </Link>
          </div>
          <div className="col-md-6">
            <Link href="/dashboard/forwarder/invoices" className="btn btn-outline-warning w-100 py-3">
              🧾 View Invoices
            </Link>
          </div>
          <div className="col-md-6">
            <Link href="/dashboard/forwarder/commission" className="btn btn-outline-info w-100 py-3">
              💰 Commission Report
            </Link>
          </div>
        </div>

        <div className="mt-5 p-4 bg-dark border border-secondary rounded">
          <h5 className="mb-3">📌 Helpful Tips</h5>
          <ul className="mb-0">
            <li>✅ Create bookings easily using the green button.</li>
            <li>✅ Track all your bookings in one place.</li>
            <li>✅ Download invoices & check commission anytime.</li>
          </ul>
        </div>
      </div>
    </ForwarderLayout>
  );
}
