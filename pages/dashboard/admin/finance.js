import Head from 'next/head'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminLayout from '@/components/layouts/AdminLayout'
import { toast } from 'react-toastify'

export default function AdminFinance() {
  const [finance, setFinance] = useState({
    totalPayments: 0,
    cardPayments: 0,
    creditAccounts: 0,
    userDebtors: [],
    forwarderDebtors: [],
  })

  const fetchFinance = async () => {
    try {
      const allPayments = await supabase.from('payments').select('amount, payment_method')
      const creditUsers = await supabase.from('users').select('*').eq('account_type', 'credit')
      const forwarders = await supabase.from('forwarders').select('*')
      const userBookings = await supabase.from('bookings').select('amount, user_id, paid, created_at')
      const fwdBookings = await supabase.from('bookings').select('amount, forwarder_id, paid, created_at')

      const totalPaid = allPayments.data.reduce((sum, p) => sum + p.amount, 0)
      const cardPaid = allPayments.data.filter(p => p.payment_method === 'card').reduce((sum, p) => sum + p.amount, 0)

      const userDebtors = creditUsers.data.map((u) => {
        const unpaid = userBookings.data.filter(b => b.user_id === u.id && !b.paid)
        const totalOwed = unpaid.reduce((sum, b) => sum + b.amount, 0)
        const oldest = unpaid.length ? new Date(unpaid.reduce((min, b) => new Date(b.created_at) < min ? new Date(b.created_at) : min, new Date()).toISOString()) : null
        return { ...u, totalOwed, oldest }
      }).filter(u => u.totalOwed > 0)

      const forwarderDebtors = forwarders.data.map((f) => {
        const unpaid = fwdBookings.data.filter(b => b.forwarder_id === f.id && !b.paid)
        const totalOwed = unpaid.reduce((sum, b) => sum + b.amount, 0)
        const oldest = unpaid.length ? new Date(unpaid.reduce((min, b) => new Date(b.created_at) < min ? new Date(b.created_at) : min, new Date()).toISOString()) : null
        return { ...f, totalOwed, oldest }
      }).filter(f => f.totalOwed > 0)

      setFinance({
        totalPayments: totalPaid,
        cardPayments: cardPaid,
        creditAccounts: creditUsers.data.length,
        userDebtors,
        forwarderDebtors,
      })
    } catch (error) {
      toast.error('Failed to fetch finance data')
    }
  }

  const isOverdue = (oldest) => {
    if (!oldest) return false
    const today = new Date()
    const diff = Math.floor((today - oldest) / (1000 * 60 * 60 * 24))
    return diff > 60
  }

  useEffect(() => {
    fetchFinance()
  }, [])

  return (
    <AdminLayout>
      <Head>
        <title>Finance | Admin | Midnight Express</title>
      </Head>

      <h1 className="display-6 fw-bold mb-4">Finance Overview</h1>

      <div className="row g-4">
        {[
          { label: 'Total Payments Received', value: `£${finance.totalPayments.toFixed(2)}` },
          { label: 'Credit Card Payments', value: `£${finance.cardPayments.toFixed(2)}` },
          { label: 'Credit Accounts Total', value: finance.creditAccounts },
        ].map((item) => (
          <div className="col-md-4" key={item.label}>
            <div className="card bg-dark text-white border-light shadow-sm h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '100px' }}>
              <h5 className="fw-bold m-0">{item.label}: {item.value}</h5>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-warning">Aged Debtors - Users</h3>

      <table className="table table-dark table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Company</th><th>Total Owed</th><th>Oldest Invoice</th>
          </tr>
        </thead>
        <tbody>
          {finance.userDebtors.map((u) => (
            <tr key={u.id} style={{ color: isOverdue(u.oldest) ? 'red' : 'inherit' }}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.company_name}</td>
              <td>£{u.totalOwed.toFixed(2)}</td>
              <td>{u.oldest ? new Date(u.oldest).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-5 text-warning">Aged Debtors - Forwarders</h3>

      <table className="table table-dark table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Total Owed</th><th>Oldest Invoice</th>
          </tr>
        </thead>
        <tbody>
          {finance.forwarderDebtors.map((f) => (
            <tr key={f.id} style={{ color: isOverdue(f.oldest) ? 'red' : 'inherit' }}>
              <td>{f.name}</td>
              <td>{f.contact_email}</td>
              <td>{f.contact_phone}</td>
              <td>£{f.totalOwed.toFixed(2)}</td>
              <td>{f.oldest ? new Date(f.oldest).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}

