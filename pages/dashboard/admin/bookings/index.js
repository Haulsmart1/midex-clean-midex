import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';  // <-- import this
import { supabase } from '@/lib/supabaseClient';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) throw error;
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">📋 Admin Bookings</h1>
        <button className="btn btn-danger" onClick={() => signOut()}>
          Log Out
        </button>
      </div>
      {bookings.length === 0 ? (
        <div className="alert alert-warning">No bookings found.</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.customer_name}</td>
                <td>{b.from}</td>
                <td>{b.to}</td>
                <td>{b.booking_date}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
