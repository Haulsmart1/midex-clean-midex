'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';   // ✅ use singleton
import ForwarderLayout from '@/components/layouts/ForwarderLayout';
import styles from '@/styles/ForwarderDashboard.module.css';

export default function ForwarderInvoices() {
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notForwarder, setNotForwarder] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      window.location.href = '/login';
      return;
    }

    const roles = session.user.roles || [session.user.role];
    if (!roles.includes('forwarder')) {
      setNotForwarder(true);
      return;
    }

    fetchInvoices();
  }, [session, status]);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error.message);
    } else {
      setInvoices(data || []);
    }

    setLoading(false);
  };

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
        <title>🧾 My Invoices | Forwarder</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-4" style={{ color: '#0aefff' }}>
          🧾 My Invoices
        </h1>

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <div className="alert alert-warning text-dark">
            No invoices available right now.
          </div>
        ) : (
          <div className={`card bg-dark text-white p-4 ${styles.cardShadow || ''}`}>
            <div className="table-responsive">
              <table className="table table-hover table-bordered table-dark">
                <thead className="table-secondary text-dark">
                  <tr>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Issued On</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_number || 'N/A'}</td>
                      <td>£{Number(invoice.total || 0).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            invoice.status === 'paid' ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ForwarderLayout>
  );
}
