import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { supabase } from '/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditForwarder() {
  const router = useRouter();
  const { id } = router.query;

  const [forwarder, setForwarder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    password: '',
    active: true
  });

  useEffect(() => {
    if (id) fetchForwarder();
  }, [id]);

  const fetchForwarder = async () => {
    const { data, error } = await supabase.from('forwarders').select('*').eq('id', id).single();
    if (error) {
      toast.error('❌ Failed to load forwarder');
    } else {
      setForm({ ...data, password: '' }); // leave password empty
      setForwarder(data);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updates = {
      name: form.name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      notes: form.notes,
      active: form.active
    };

    if (form.password) {
      const hashed = await bcrypt.hash(form.password, 10);
      updates.password = hashed;
    }

    const { error } = await supabase.from('forwarders').update(updates).eq('id', id);
    if (error) {
      toast.error('❌ Update failed');
    } else {
      toast.success('✅ Forwarder updated');
      router.push('/dashboard/admin/forwarders');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this forwarder?')) return;
    const { error } = await supabase.from('forwarders').delete().eq('id', id);
    if (!error) {
      toast.success('🗑️ Deleted successfully');
      router.push('/dashboard/admin/forwarders');
    }
  };

  if (loading) return <AdminLayout><div className="p-4 text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Head><title>Edit Forwarder | Admin</title></Head>
      <div className="container py-4 text-white">
        <h1 className="display-6 mb-4">Edit Forwarder</h1>

        <form onSubmit={handleSubmit} className="bg-dark p-4 rounded border">
          {['name', 'contact_email', 'contact_phone', 'notes'].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label text-capitalize">{field.replace('_', ' ')}</label>
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">New Password (optional)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Leave blank to keep current"
            />
          </div>

          <div className="form-check form-switch mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            <label className="form-check-label">Active</label>
          </div>

          <button type="submit" className="btn btn-warning w-100 mb-3 fw-bold">Save Changes</button>
          <button type="button" onClick={handleDelete} className="btn btn-danger w-100 fw-bold">Delete Forwarder</button>
        </form>

        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </AdminLayout>
  );
}
