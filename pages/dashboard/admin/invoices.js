// pages/dashboard/admin/invoices.js

import { useState } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layouts/AdminLayout'

export default function AdminInvoicePanel() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleBulkInvoices() {
    setLoading(true)
    setStatus('Generating invoices...')
    try {
      const res = await fetch('/api/generate-invoices', { method: 'POST' })
      const data = await res.json()
      setStatus(data.message || data.error || 'Done')
    } catch (err) {
      setStatus('❌ Failed to generate invoices')
    }
    setLoading(false)
  }

  return (
    <AdminLayout>
      <Head>
        <title>Invoices | Admin | Midnight Express</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            background: 'rgba(20,24,38,0.95)',
            borderRadius: '1rem',
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h2 className="fw-bold mb-4" style={{ color: '#00d4ff' }}>
            Invoice Management
          </h2>

          <p className="text-muted mb-4">
            Generate invoices for all completed bookings that have not yet been invoiced.
          </p>

          <button
            onClick={handleBulkInvoices}
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Processing...' : '📄 Generate Invoices'}
          </button>

          {status && (
            <div className="mt-4">
              <span
                className={`badge ${
                  status.startsWith('❌') ? 'bg-danger' : 'bg-success'
                } p-2`}
              >
                {status}
              </span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
