// pages/dashboard/admin/bookings/index.js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import supabase from '@/lib/supabaseClient';
import AdminLayout from '@/components/layouts/AdminLayout';

const PAGE_SIZE = 20;

export default function AdminBookingsIndex() {
  const router = useRouter();
  const { status } = useSession();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // derive pagination
  const from = useMemo(() => (page - 1) * PAGE_SIZE, [page]);
  const to = useMemo(() => from + PAGE_SIZE - 1, [from]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  useEffect(() => {
    if (status === 'loading') return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, q, statusFilter]);

  async function fetchData() {
    setLoading(true);

    // base query
    let query = supabase
      .from('bookings')
      .select(
        `
          id,
          created_at,
          status,
          amount,
          currency,
          has_paid,
          collections,
          deliveries,
          customer,
          user_id
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    // search by id, customer, or postcode in first collection/delivery
    if (q.trim()) {
      const term = q.trim();
      // Try match UUID or plain id first; fallback to ilike on customer
      // Note: for array/json fields we can only do coarse filtering client-side after fetch
      query = query.ilike('customer', `%${term}%`);
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error, count: c } = await query;

    if (!error) {
      // light client-side enrichment for quick glance
      const formatted = (data || []).map((b) => ({
        ...b,
        fromPostcode: b.collections?.[0]?.postcode || '',
        toPostcode: b.deliveries?.[0]?.postcode || '',
      }));
      setRows(formatted);
      setCount(c || 0);
    } else {
      console.error('Failed to load bookings:', error.message);
      setRows([]);
      setCount(0);
    }

    setLoading(false);
  }

  function gotoCreate() {
    router.push('/dashboard/admin/bookings/create');
  }

  function gotoRow(id) {
    router.push(`/dashboard/admin/bookings/${id}`);
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="m-0" style={{ color: '#00d4ff' }}>Admin · Bookings</h2>
          <button className="btn btn-primary fw-bold" onClick={gotoCreate}>
            ➕ New Booking
          </button>
        </div>

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <input
              className="form-control"
              placeholder="Search by customer"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              <option value="draft">draft</option>
              <option value="pending_payment">pending_payment</option>
              <option value="pending_approval">pending_approval</option>
              <option value="confirmed">confirmed</option>
              <option value="in_transit">in_transit</option>
              <option value="delivered">delivered</option>
              <option value="signed_off">signed_off</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div className="col-6 col-md-3 d-flex align-items-center">
            <div className="ms-auto text-muted">
              {loading ? 'Loading…' : `${count} total`}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover align-middle">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Created</th>
                <th>ID</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Status</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Paid</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No bookings found.
                  </td>
                </tr>
              )}

              {rows.map((b) => (
                <tr key={b.id} onClick={() => gotoRow(b.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {b.id}
                  </td>
                  <td>{b.customer || '—'}</td>
                  <td>
                    {(b.fromPostcode || '—')}{' '}
                    <span className="text-muted">→</span>{' '}
                    {(b.toPostcode || '—')}
                  </td>
                  <td>
                    <span className="badge bg-secondary text-uppercase">
                      {b.status || '—'}
                    </span>
                  </td>
                  <td className="text-end">
                    {typeof b.amount === 'number'
                      ? `${(b.currency || 'GBP').toUpperCase()} ${(b.amount / 100).toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="text-center">{b.has_paid ? '✅' : '—'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={(e) => {
                        e.stopPropagation();
                        gotoRow(b.id);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Page {page} of {totalPages}
          </div>
          <div className="btn-group">
            <button
              className="btn btn-outline-light"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              ‹ Prev
            </button>
            <button
              className="btn btn-outline-light"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
