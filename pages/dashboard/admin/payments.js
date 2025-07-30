import Head from 'next/head'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'react-toastify'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('id, amount, currency, payment_method, paid_at, user_id, users(name)')
      .order('paid_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch payments')
    } else {
      setPayments(data)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const deletePayment = async (id) => {
    if (!confirm('Delete this payment record?')) return
    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (error) toast.error('Failed to delete payment')
    else {
      toast.success('Payment deleted')
      fetchPayments()
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>Payments | Admin | Midnight Express</title>
      </Head>

      <h1 className="display-6 fw-bold mb-4">Payments</h1>
      <p className="text-muted mb-5">Monitor all system payments.</p>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-bordered align-middle">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Method</th>
              <th>Paid At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.users?.name || 'Unknown User'}</td>
                <td>{p.amount}</td>
                <td>{p.currency.toUpperCase()}</td>
                <td>{p.payment_method}</td>
                <td>{new Date(p.paid_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => deletePayment(p.id)} className="btn btn-sm btn-outline-danger m-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
