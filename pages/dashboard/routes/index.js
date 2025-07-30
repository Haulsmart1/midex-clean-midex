// pages/dashboard/admin/routes.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '/lib/supabaseClient';
import { toast } from 'react-toastify';
import SafeMapImage from '@/components/routes/SafeMapImage';

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const { data, error } = await supabase.from('routes').select('*');
    if (error) toast.error('Failed to load routes');
    else setRoutes(data);
  };

  const handleInputChange = (id, field, value) => {
    setRoutes((prev) =>
      prev.map((route) => (route.id === id ? { ...route, [field]: value } : route))
    );
  };

  const handleUpdate = async (id, field, value) => {
    const { error } = await supabase.from('routes').update({ [field]: value }).eq('id', id);
    if (error) toast.error(`Failed to update ${field}`);
    else toast.success(`✅ ${field.replace('_', ' ')} updated`);
  };

  const handleSelectChange = (id, field, value) => {
    handleInputChange(id, field, value);
    handleUpdate(id, field, value);
  };

  return (
    <AdminLayout>
      <Head>
        <title>🚦 Manage Routes | Admin Dashboard</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">🛣️ Manage Freight Routes</h1>

        <div className="table-responsive">
          <table className="table table-dark table-bordered align-middle">
            <thead>
              <tr>
                <th>Route</th>
                <th>Map</th>
                <th>Status</th>
                <th>Traffic Light</th>
                <th>Route Message</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id}>
                  <td className="fw-semibold text-success">
                    {route.from} ⇄ {route.to}
                  </td>
                  <td>
                    <SafeMapImage from={route.from} to={route.to} apiKey={GOOGLE_KEY} />
                  </td>
                  <td>
                    <select
                      className="form-select bg-dark text-light"
                      value={route.status}
                      onChange={(e) => handleSelectChange(route.id, 'status', e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select bg-dark text-light"
                      value={route.traffic_light || 'green'}
                      onChange={(e) =>
                        handleSelectChange(route.id, 'traffic_light', e.target.value)
                      }
                    >
                      <option value="green">🟢 Green</option>
                      <option value="amber">🟡 Amber</option>
                      <option value="red">🔴 Red</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control bg-dark text-light"
                      value={route.route_message || ''}
                      onChange={(e) =>
                        handleInputChange(route.id, 'route_message', e.target.value)
                      }
                      onBlur={(e) =>
                        handleUpdate(route.id, 'route_message', e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
