'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForwarderCommission() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);

  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);

    console.log('✅ Forwarder UID:', session?.user?.id);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', session?.user?.id) // ✅ FIXED
      .eq('status', 'confirmed');

    if (error) {
      console.error('❌ Supabase Error:', error);
      toast.error('Failed to load bookings');
    } else {
      setBookings(data);
      setFiltered(data);
      computeCommission(data);
    }

    setLoading(false);
  };

  const computeCommission = (data) => {
    const sum = data.reduce((acc, cur) => acc + (parseFloat(cur.commission) || 0), 0);
    setTotalCommission(sum);
  };

  const filterBookings = () => {
    let filteredData = [...bookings];

    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);

      filteredData = filteredData.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate >= fromDate && bookingDate <= toDate;
      });
    }

    setFiltered(filteredData);
    computeCommission(filteredData);
  };

  const handleExportCSV = () => {
    const csv = filtered.map(b => ({
      ID: b.id,
      Route: b.route_id,
      Commission: b.commission,
      Created: b.created_at
    }));

    const csvData = [
      Object.keys(csv[0]).join(','),
      ...csv.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'commission_report.csv';
    a.click();
  };

  return (
    <ForwarderLayout>
      <Head>
        <title>Commission | Forwarder</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="mb-3">💷 Commission Dashboard</h1>

        {loading ? (
          <p>Loading commission data...</p>
        ) : (
          <>
            <div className="row mb-3">
              <div className="col-md-3">
                <label className="form-label">From</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">To</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button onClick={filterBookings} className="btn btn-primary w-100">🔍 Filter</button>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button onClick={handleExportCSV} className="btn btn-success w-100">⬇️ Export CSV</button>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-dark text-white p-3">
                  <h5>Total Bookings</h5>
                  <p className="fs-4">{filtered.length}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-dark text-white p-3">
                  <h5>Total Commission</h5>
                  <p className="fs-4">£{totalCommission.toFixed(2)}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-dark text-white p-3">
                  <h5>Average per Booking</h5>
                  <p className="fs-4">£{(totalCommission / (filtered.length || 1)).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <table className="table table-dark table-hover table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Route</th>
                  <th>Commission</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.route_id}</td>
                    <td>£{parseFloat(b.commission).toFixed(2)}</td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <ToastContainer position="bottom-right" />
      </div>
    </ForwarderLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
