import { useState } from 'react';

export default function AdminInvoicePanel() {
  const [status, setStatus] = useState('');

  async function handleBulkInvoices() {
    setStatus('Working...');
    const res = await fetch('/api/generate-invoices', { method: 'POST' });
    const data = await res.json();
    setStatus(data.message || data.error);
  }

  return (
    <div>
      <button onClick={handleBulkInvoices} className="btn btn-primary">
        Generate Invoices for Completed Bookings
      </button>
      <div>{status}</div>
    </div>
  );
}
