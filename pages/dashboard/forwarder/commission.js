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

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', session?.user?.id)
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
    if (!filtered.length) {
      toast.warning("⚠️ No data to export!");
      return;
    }

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
        <title>💷 Commission | Forwarder</title>
      </Head>

      <div style={{ padding: "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#ff7ee2",
            textAlign: "center",
            marginBottom: "2rem",
            fontWeight: 700,
            textShadow: "0 0 18px rgba(255, 126, 226, 0.7)"
          }}
        >
          💷 Commission Dashboard
        </h1>

        {loading ? (
          <p className="text-center">Loading commission data...</p>
        ) : (
          <>
            {/* Filters */}
            <div className="neon-card d-flex flex-wrap align-items-end justify-content-between mb-4 p-3 gap-3">
              <div>
                <label className="form-label">From</label>
                <input
                  type="date"
                  className="form-control neon-input"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">To</label>
                <input
                  type="date"
                  className="form-control neon-input"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <button
                onClick={filterBookings}
                className="btn neon-btn neon-primary"
              >
                🔍 Filter
              </button>
              <button
                onClick={handleExportCSV}
                className="btn neon-btn neon-secondary"
              >
                ⬇️ Export CSV
              </button>
            </div>

            {/* Stats */}
            <div className="row mb-4 g-3">
              <div className="col-md-4">
                <div className="neon-card text-center p-4">
                  <h5>Total Bookings</h5>
                  <p className="fs-4">{filtered.length}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="neon-card text-center p-4">
                  <h5>Total Commission</h5>
                  <p className="fs-4">£{totalCommission.toFixed(2)}</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="neon-card text-center p-4">
                  <h5>Average per Booking</h5>
                  <p className="fs-4">£{(totalCommission / (filtered.length || 1)).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="neon-card p-3">
              <table className="neon-table mb-0">
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
            </div>
          </>
        )}

        <ToastContainer position="bottom-right" />
      </div>

      {/* Scoped Styles */}
      <style jsx>{`
        .neon-card {
          background: rgba(20, 15, 30, 0.9);
          border-radius: 1rem;
          box-shadow: 0 0 25px rgba(157, 107, 255, 0.25),
            0 0 45px rgba(0, 212, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .neon-input {
          background: #111a22;
          border: 1px solid #333;
          color: #eee;
          padding: 0.55rem 0.9rem;
          border-radius: 10px;
        }
        .neon-btn {
          font-weight: 600;
          border-radius: 10px;
          padding: 0.65rem 1.2rem;
          border: none;
          transition: all 0.25s ease;
        }
        .neon-primary {
          background: linear-gradient(90deg, #ff7ee2, #9d6bff);
          color: #fff;
        }
        .neon-primary:hover {
          box-shadow: 0 0 12px #ff7ee2aa;
        }
        .neon-secondary {
          background: linear-gradient(90deg, #13f1fc, #45ffc2);
          color: #091821;
        }
        .neon-secondary:hover {
          box-shadow: 0 0 12px #13f1fcaa;
        }
        .neon-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }
        .neon-table thead {
          background: linear-gradient(90deg, #ff7ee2, #9d6bff);
          color: #fff;
          font-weight: 600;
        }
        .neon-table th, .neon-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .neon-table tbody tr {
          color: #eee;
          transition: background 0.25s ease;
        }
        .neon-table tbody tr:hover {
          background: rgba(255, 126, 226, 0.08);
        }
      `}</style>
    </ForwarderLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
