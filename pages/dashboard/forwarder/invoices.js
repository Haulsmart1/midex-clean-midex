import Head from 'next/head'
import { useEffect, useState } from 'react'
import { supabase } from '/lib/supabaseClient'
import ForwarderLayout from '../../../components/layouts/ForwarderLayout'

export default function ForwarderInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase Error:', error)
    } else {
      setInvoices(data)
    }
    setLoading(false)
  }

  return (
    <ForwarderLayout>
      <Head>
        <title>Invoices | Forwarder | Midnight Express</title>
      </Head>

      <h1 className="page-title">My Invoices</h1>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div className="alert alert-warning text-dark">
          No invoices available right now.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover table-bordered">
            <thead>
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
                  <td>{invoice.invoice_number}</td>
                  <td>£{invoice.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${invoice.status === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ForwarderLayout>
  )
}
