import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '/lib/supabaseClient';
import { toast } from 'react-toastify';
import SafeMapImage from '@/components/routes/SafeMapImage';

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState('');
  const [newRoute, setNewRoute] = useState({
    from: '', to: '', description: '', status: 'open', traffic_light: 'green', route_message: ''
  });

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    const { data, error } = await supabase.from('routes').select('*').order('from');
    if (error) toast.error('Failed to load routes');
    else setRoutes(data);
  };

  const handleInputChange = (id, field, value) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleUpdate = async (id, field, value) => {
    const { error } = await supabase.from('routes').update({ [field]: value }).eq('id', id);
    if (error) toast.error(`Failed to update ${field}`);
    else toast.success(`✅ ${field} updated`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else {
      toast.success('Route deleted');
      fetchRoutes();
    }
  };

  const handleAdd = async () => {
    const { data, error } = await supabase.from('routes').insert([newRoute]);
    if (error) toast.error('Failed to add route');
    else {
      toast.success('✅ Route added');
      setNewRoute({ from: '', to: '', description: '', status: 'open', traffic_light: 'green', route_message: '' });
      fetchRoutes();
    }
  };

  const filteredRoutes = routes.filter(r =>
    r.from.toLowerCase().includes(filter.toLowerCase()) ||
    r.to.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AdminLayout>
      <Head>
        <title>🛣️ Manage Routes | Admin Dashboard</title>
      </Head>

      <div className="container py-4 text-white">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold">🛣️ Manage Freight Routes</h1>
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search by location"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="mb-5 bg-dark p-4 rounded border border-secondary">
          <h5 className="text-light">➕ Add New Route</h5>
          <div className="row g-3">
            {['from', 'to', 'description', 'route_message'].map((field) => (
              <div className="col-md-3" key={field}>
                <input
                  className="form-control"
                  placeholder={field.replace('_', ' ')}
                  value={newRoute[field]}
                  onChange={(e) => setNewRoute({ ...newRoute, [field]: e.target.value })}
                />
              </div>
            ))}
            <div className="col-md-2">
              <select
                className="form-select"
                value={newRoute.status}
                onChange={(e) => setNewRoute({ ...newRoute, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={newRoute.traffic_light}
                onChange={(e) => setNewRoute({ ...newRoute, traffic_light: e.target.value })}
              >
                <option value="green">🟢 Green</option>
                <option value="amber">🟡 Amber</option>
                <option value="red">🔴 Red</option>
              </select>
            </div>
            <div className="col-md-12 text-end">
              <button className="btn btn-success px-4" onClick={handleAdd}>Add Route</button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-bordered align-middle">
            <thead>
              <tr>
                <th>Route</th>
                <th>Map</th>
                <th>Status</th>
                <th>Traffic</th>
                <th>Message</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route.id}>
                  <td>{route.from} → {route.to}</td>
                  <td>
                    <SafeMapImage from={route.from} to={route.to} apiKey={GOOGLE_KEY} />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={route.status}
                      onChange={(e) => handleUpdate(route.id, 'status', e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={route.traffic_light || 'green'}
                      onChange={(e) => handleUpdate(route.id, 'traffic_light', e.target.value)}
                    >
                      <option value="green">🟢 Green</option>
                      <option value="amber">🟡 Amber</option>
                      <option value="red">🔴 Red</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      value={route.route_message || ''}
                      onChange={(e) => handleInputChange(route.id, 'route_message', e.target.value)}
                      onBlur={(e) => handleUpdate(route.id, 'route_message', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(route.id)}
                    >
                      🗑️
                    </button>
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
