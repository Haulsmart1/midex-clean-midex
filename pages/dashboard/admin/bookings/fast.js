// /pages/dashboard/admin/bookings/fast.js

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabaseClient';

export default function FastBookingsAdmin() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      router.push('/dashboard');
    } else {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fast_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setBookings(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    await supabase
      .from('fast_bookings')
      .update({ status: newStatus })
      .eq('id', id);
    fetchBookings();
  };

  if (loading) {
    return <p className="text-center py-10">Loading bookings...</p>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Fast Van/Truck Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-2">Vehicle</th>
                <th className="p-2">Weight (kg)</th>
                <th className="p-2">Pallets</th>
                <th className="p-2">Pickup</th>
                <th className="p-2">Delivery</th>
                <th className="p-2">Fridge</th>
                <th className="p-2">ADR</th>
                <th className="p-2">Sheets/Rope</th>
                <th className="p-2">Low Loader</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b text-center">
                  <td className="p-2">{b.selected_vehicle}</td>
                  <td className="p-2">{b.freight_weight}</td>
                  <td className="p-2">{b.number_of_pallets}</td>
                  <td className="p-2">{b.pickup_address}</td>
                  <td className="p-2">{b.delivery_address}</td>
                  <td className="p-2">{b.fridge_required ? 'Yes' : 'No'}</td>
                  <td className="p-2">{b.adr_required ? 'Yes' : 'No'}</td>
                  <td className="p-2">{b.sheets_and_rope ? 'Yes' : 'No'}</td>
                  <td className="p-2">{b.low_loader ? 'Yes' : 'No'}</td>
                  <td className="p-2 font-bold">{b.status}</td>
                  <td className="p-2 flex flex-col gap-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => updateStatus(b.id, 'Accepted')}
                    >Accept</button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => updateStatus(b.id, 'Cancelled')}
                    >Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
