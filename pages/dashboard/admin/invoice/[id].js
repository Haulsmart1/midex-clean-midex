// pages/dashboard/admin/invoice/[id].js

import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '@/components/layouts/AdminLayout'; // Make sure you have this or switch to your main layout

export default function AdminInvoicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState(null);
  const [booking, setBooking] = useState(null);
  const [editNumber, setEditNumber] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchInvoice();
    }
    // eslint-disable-next-line
  }, [status, id]);

  async function fetchInvoice() {
    setLoading(true);
    setError(null);

    // --- Fetch invoice by ID (no forwarder restriction) ---
    const { data: inv, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invError) {
      setError(invError.message || 'Invoice not found');
      setLoading(false);
      return;
    }
    setInvoice(inv);
    setEditNumber(inv.invoice_number || '');
    setEditStatus(inv.status || 'draft');

    // --- Fetch company "from" settings ---
    const { data: st } = await supabase.from('settings').select('*').eq('key', 'company').single();
    setSettings(st?.value || {});

    // --- Fetch linked booking for optional line item info ---
    const { data: bk } = await supabase.from('bookings').select('*').eq('id', inv.booking_id).single();
    setBooking(bk);

    setLoading(false);
  }

  // --- ADMIN: ALLOW EDITING INVOICE NUMBER & STATUS ---
  async function updateInvoice() {
    const { error: upErr } = await supabase
      .from('invoices')
      .update({
        invoice_number: editNumber,
        status: editStatus
      })
      .eq('id', invoice.id);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setInvoice({ ...invoice, invoice_number: editNumber, status: editStatus });
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Invoice {invoice?.invoice_number || id} | Midnight Express</title>
      </Head>
      <div className="container py-4 text-light">
        <h1 className="mb-4">Admin: Invoice {invoice?.invoice_number || id}</h1>
        {loading && <p>Loading invoice...</p>}
        {error && <div className="alert alert-danger text-dark">{error}</div>}

        {invoice && settings && (
          <div className="card bg-dark border-light shadow p-4">
            <div className="d-flex justify-content-between mb-4">
              <div>
                <b>From:</b>
                <div>{settings.name}</div>
                <div>{settings.address}</div>
                <div>Company #: {settings.company_number}</div>
                <div>Tel: {settings.tel}</div>
                <div>{settings.email}</div>
                <div>VAT: {settings.vat}</div>
              </div>
              <div>
                <b>To:</b>
                <div>{invoice.invoice_to?.name || booking?.customer || 'N/A'}</div>
                <div>{invoice.invoice_to?.address || booking?.destination || ''}</div>
              </div>
            </div>

            {/* INVOICE NUMBER + STATUS (ADMIN EDITABLE) */}
            <div className="mb-2">
              <b>Invoice Number:</b>{" "}
              <input
                value={editNumber}
                onChange={e => setEditNumber(e.target.value)}
                style={{ width: 120 }}
              />
            </div>
            <div className="mb-2">
              <b>Status:</b>{" "}
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                style={{ width: 140 }}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="btn btn-sm btn-primary ms-2" onClick={updateInvoice}>Save</button>
            </div>
            <div><b>Date:</b> {new Date(invoice.created_at).toLocaleDateString()}</div>
            <hr />

            <div>
              <div>Subtotal: £{invoice.subtotal}</div>
              <div>Commission: £{invoice.commission_amount} ({invoice.commission_percent}%)</div>
              <div>VAT: £{invoice.vat}</div>
              <div><b>Total: £{invoice.total}</b></div>
            </div>
            <p className="text-muted small mt-3">
              Invoice created: {new Date(invoice.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
