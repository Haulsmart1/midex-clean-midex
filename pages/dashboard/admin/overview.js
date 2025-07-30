import Head from 'next/head'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'react-toastify'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    forwarders: 0,
    bookings: 0,
    payments: 0,
  })

  const fetchStats = async () => {
    try {
      const users = await supabase.from('users').select('id', { count: 'exact' }).eq('role', 'user')
      const admins = await supabase.from('users').select('id', { count: 'exact' }).eq('role', 'admin')
      const forwarders = await supabase.from('forwarders').select('id', { count: 'exact' })
      const bookings = await supabase.from('bookings').select('id', { count: 'exact' })
      const payments = await supabase.from('payments').select('id', { count: 'exact' })

      setStats({
        users: users.count || 0,
        admins: admins.count || 0,
        forwarders: forwarders.count || 0,
        bookings: bookings.count || 0,
        payments: payments.count || 0,
      })
    } catch (error) {
      toast.error('Failed to fetch stats')
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <AdminLayout>
      <Head>
        <title>Overview | Admin | Midnight Express</title>
      </Head>

      <h1 className="display-6 fw-bold mb-4">System Overview</h1>
      <p className="text-muted mb-5">Live system metrics and totals.</p>

      <div className="row g-4">

        {[
          { label: 'Users', value: stats.users },
          { label: 'Admins', value: stats.admins },
          { label: 'Forwarders', value: stats.forwarders },
          { label: 'Bookings', value: stats.bookings },
          { label: 'Payments', value: stats.payments },
        ].map((item) => (
          <div className="col-md-4" key={item.label}>
            <div className="card bg-dark text-white border-light shadow-sm h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '100px' }}>
              <h5 className="fw-bold m-0">{item.label}: {item.value}</h5>
            </div>
          </div>
        ))}

      </div>
    </AdminLayout>
  )
}
