// pages/dashboard/users/invoices.js

import Head from 'next/head';
import UserLayout from '@/components/layouts/UsersLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // ✅ Correct import for Supabase
import { useSession } from 'next-auth/react';

export default function UserInvoices() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices') // ✅ make sure your table is called "invoices" in Supabase
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch invoices:', error.message);
      } else {
        setInvoices(data);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, [session]);

  return (
    <UserLayout>
      <Head>
        <title>Invoices | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-5 fw-bold mb-4 text-center">My Invoices</h1>

        {loading ? (
          <p className="text-secondary text-center">Loading your invoices...</p>
        ) : invoices.length === 0 ? (
          <div className="alert alert-warning text-dark text-center">
            No invoices found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover table-bordered text-center">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice Number</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td>{invoice.invoice_number}</td>
                    <td>£{invoice.amount.toFixed(2)}</td>
                    <td>
                      {invoice.status === 'paid' ? (
                        <span className="badge bg-success">Paid</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td>
                      {invoice.pdf_url ? (
                        <a
                          href={invoice.pdf_url}
                          className="btn btn-outline-light btn-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <small>No PDF</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
