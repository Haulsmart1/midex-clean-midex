import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';

export default function ForwarderInvoicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [invoice, setInvoice] = useState(null);
  const [booking, setBooking] = useState(null);
  const [settings, setSettings] = useState({
    name: "Midnight Express Europe Ltd",
    address: "Church View, Newton Arlosh, Wigton, Cumbria, England, CA7 5ET",
    company_number: "16353948",
    tel: "+44 (0) 800 999 1263",
    email: "freight@midnight-express.org",
    vat: "TBC"
  });
  const [editNumber, setEditNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const printRef = useRef();

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchInvoice();
    }
  }, [status, id]);

  async function fetchInvoice() {
    setLoading(true);
    setError(null);

    // 1. Fetch invoice
    const { data: invoiceData, error: invoiceErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceErr || !invoiceData) {
      setError(invoiceErr?.message || 'Invoice not found');
      setLoading(false);
      return;
    }

    setInvoice(invoiceData);
    setEditNumber(invoiceData?.invoice_number || '');

    // 2. Fetch booking
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', invoiceData.booking_id)
      .single();

    setBooking(bookingData);

    // 3. Fetch settings (company info, commission, etc)
    const { data: settingsRow } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'company')
      .single();

    if (settingsRow?.value) setSettings(settingsRow.value);

    setLoading(false);
  }

  // Commission logic
  function getCommission(invoice, settings) {
    const percent =
      invoice.commission_percent ??
      (invoice.ferry_leg
        ? (settings.default_commission?.ferry || 10)
        : (settings.default_commission?.land || 0));
    const amount = (invoice.subtotal || 0) * (percent / 100);
    return { percent, amount };
  }

  // Save Invoice Number
  async function updateInvoiceNumber() {
    if (!invoice) return;
    await supabase
      .from('invoices')
      .update({ invoice_number: editNumber })
      .eq('id', invoice.id);
    setInvoice({ ...invoice, invoice_number: editNumber });
  }

  // Print/PDF
  function handlePrint() {
    if (window && printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }

  if (loading) return <ForwarderLayout><div className="container py-4 text-light">Loading…</div></ForwarderLayout>;
  if (error) return <ForwarderLayout><div className="container py-4"><div className="alert alert-danger">{error}</div></div></ForwarderLayout>;
  if (!invoice || !booking) return <ForwarderLayout><div className="container py-4">No invoice found.</div></ForwarderLayout>;

  const commission = getCommission(invoice, settings);
  const isForwarder = session?.user?.id === invoice.forwarder_id || session?.user?.role === "forwarder";

  return (
    <ForwarderLayout>
      <Head>
        <title>Invoice #{invoice.invoice_number || invoice.id?.slice(0, 8)} | Midnight Express</title>
      </Head>
      <div className="container py-4 text-light">
        <button className="btn btn-secondary mb-3" onClick={handlePrint}>
          🖨️ Print / PDF Invoice
        </button>
        <div ref={printRef} className="bg-dark rounded shadow p-4" style={{ maxWidth: 780, margin: "0 auto" }}>
          <h2 className="mb-3">INVOICE</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
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
              <div>{invoice.invoice_to?.name || booking?.deliveryPoints?.[0]?.name}</div>
              <div>{invoice.invoice_to?.address || booking?.deliveryPoints?.[0]?.address}</div>
            </div>
          </div>
          <div>
            <b>Invoice Number:</b>{" "}
            {isForwarder ? (
              <>
                <input
                  value={editNumber}
                  onChange={e => setEditNumber(e.target.value)}
                  style={{ width: 120 }}
                />
                <button className="btn btn-sm btn-primary ms-2" onClick={updateInvoiceNumber}>Save</button>
              </>
            ) : (
              <span>{invoice.invoice_number}</span>
            )}
          </div>
          <div><b>Date:</b> {new Date(invoice.created_at).toLocaleDateString()}</div>
          <div><b>Status:</b> {invoice.status}</div>
          <hr />
          <div>
            <div>Subtotal: £{invoice.subtotal?.toFixed(2)}</div>
            <div>Commission: £{invoice.commission_amount?.toFixed(2) ?? commission.amount.toFixed(2)} ({invoice.commission_percent ?? commission.percent}%)</div>
            <div>VAT: £{invoice.vat?.toFixed(2)}</div>
            <div><b>Total: £{invoice.total?.toFixed(2)}</b></div>
          </div>
          <hr />
          <div className="mt-3">
            <b>Consignment Ref:</b> {booking.consignment_ref || 'N/A'}<br/>
            <b>Customer:</b> {booking.customer || 'N/A'}<br/>
            <b>Destination:</b> {booking.destination || booking?.deliveryPoints?.[0]?.address}<br/>
            <b>Vehicle Type:</b> {booking.vehicle_type || 'N/A'}
          </div>
        </div>
      </div>
    </ForwarderLayout>
  );
}

