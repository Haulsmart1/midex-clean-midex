'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabaseClient';

const STATUS_STEPS = {
  accepted: 1,
  in_progress: 2,
  completed: 3,
  cannot_complete: 3,
};

const STATUS_LABELS = {
  accepted: 'Job Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cannot_complete: 'Cannot Complete',
};

export default function CurrysBookingsAll() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const perPage = 6;
  const pageCount = Math.ceil(filtered.length / perPage);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return router.push('/login');

    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings_currys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching:', error);
        setBookings([]);
      } else {
        setBookings(data);
        setFiltered(data);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [status]);

  useEffect(() => {
    if (filterStatus) {
      setFiltered(bookings.filter(b => b.status === filterStatus));
    } else {
      setFiltered(bookings);
    }
    setPage(1);
  }, [filterStatus, bookings]);

  const handleExport = () => {
    const headers = [
      'Ref', 'Battery Type', 'Qty', 'Status', 'Notes',
      'Customer Name', 'Email', 'Mobile', 'Address', 'Postcode', 'Country',
      'Battery Serial', 'Collection Date', 'Pets', 'Parking', 'Accessibility', 'Health & Safety'
    ];

    const rows = bookings.map(b => [
      b.internal_ref, b.battery_type, b.quantity, b.status, b.notes?.replace(/\n/g, ' ') || '',
      b.customer_name, b.email, b.mobile, b.address, b.postcode, b.country,
      b.battery_serial, b.collection_date, b.pets, b.parking, b.accessibility_issues, b.health_safety_issues
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'currys_bookings.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderProgress = (status) => {
    const step = STATUS_STEPS[status] || 0;
    const percent = (step / 3) * 100;
    const label = STATUS_LABELS[status] || 'Unknown';

    return (
      <div>
        <div className="progress" style={{ height: '12px' }}>
          <div
            className={`progress-bar progress-bar-striped ${status === 'cannot_complete' ? 'bg-danger' : 'bg-success'}`}
            style={{ width: `${percent}%`, transition: 'width 0.5s ease' }}
          />
        </div>
        <small className="text-muted">{label}</small>
      </div>
    );
  };

  return (
    <div className="container py-5" style={{ backgroundColor: '#1a1831', minHeight: '100vh', color: '#fff' }}>
      
      {/* Back & Logout buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            onClick={() => router.push('/dashboard/currys')}
            className="btn btn-warning me-2"
          >
            ← Back
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Header + Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#ffc600', fontWeight: 'bold' }}>📦 Currys Bookings</h2>
        <div>
          <Link href="/dashboard/currys/bookings/create" className="btn btn-success me-2">
            ➕ New Booking
          </Link>
          <button onClick={handleExport} className="btn btn-outline-info">
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="mb-4" style={{ maxWidth: 300 }}>
        <label className="form-label">Filter by Status</label>
        <select
          className="form-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cannot_complete">Cannot Complete</option>
        </select>
      </div>

      {/* Booking Cards */}
      {loading ? (
        <div className="text-light">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-light">No bookings found.</div>
      ) : (
        <>
          <div className="row">
            {filtered.slice((page - 1) * perPage, page * perPage).map(booking => (
              <div className="col-md-6 col-lg-4 mb-4" key={booking.id}>
                <div className="card h-100 shadow-sm" style={{ backgroundColor: '#2b254a', color: '#fff' }}>
                  <div className="card-body">
                    <h5 className="card-title" style={{ fontWeight: 'bold' }}>{booking.internal_ref}</h5>
                    <p className="card-text mb-1"><strong>Battery:</strong> {booking.battery_type}</p>
                    <p className="card-text mb-1"><strong>Qty:</strong> {booking.quantity}</p>
                    <p className="card-text mb-1"><strong>Action:</strong> {booking.triage_action}</p>
                    {booking.notes && <p className="card-text mb-1"><strong>Notes:</strong> {booking.notes}</p>}
                    <p className="card-text mb-1"><strong>Created:</strong> {new Date(booking.created_at).toLocaleString()}</p>
                    {booking.customer_name && <p className="card-text mb-1"><strong>Name:</strong> {booking.customer_name}</p>}
                    {booking.address && (
                      <p className="card-text mb-1">
                        <strong>Address:</strong> {booking.address}, {booking.postcode}, {booking.country}
                      </p>
                    )}
                    {booking.mobile && <p className="card-text mb-1"><strong>Mobile:</strong> {booking.mobile}</p>}
                    {booking.email && <p className="card-text mb-1"><strong>Email:</strong> {booking.email}</p>}
                    {booking.battery_serial && <p className="card-text mb-1"><strong>Serial No:</strong> {booking.battery_serial}</p>}
                    {booking.collection_date && <p className="card-text mb-1"><strong>Collection:</strong> {booking.collection_date}</p>}
                    {booking.pets && <p className="card-text mb-1"><strong>Pets:</strong> {booking.pets}</p>}
                    {booking.parking && <p className="card-text mb-1"><strong>Parking:</strong> {booking.parking}</p>}
                    {booking.accessibility_issues && <p className="card-text mb-1"><strong>Accessibility:</strong> {booking.accessibility_issues}</p>}
                    {booking.health_safety_issues && <p className="card-text mb-1"><strong>H&S:</strong> {booking.health_safety_issues}</p>}
                    <div className="mt-2">{renderProgress(booking.status)}</div>
                    <Link
                      href={`/dashboard/currys/bookings/edit/${booking.id}`}
                      className="btn btn-outline-light btn-sm mt-3"
                    >
                      ✏️ Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <ul className="pagination pagination-sm">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
