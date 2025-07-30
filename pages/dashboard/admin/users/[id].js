import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { supabase } from '/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    company_name: '',
    email: '',
    address: '',
    postcode: '',
    eori_number: '',
    account_type: 'cash',
    approved: false,
    banned: false,
    has_paid: false,
    password: ''
  });

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) {
      toast.error('❌ Failed to load user');
    } else {
      setForm({ ...data, password: '' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updates = { ...form };

    if (form.password) {
      updates.password = await bcrypt.hash(form.password, 10);
    } else {
      delete updates.password;
    }

    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) {
      toast.error('❌ Update failed');
    } else {
      toast.success('✅ User updated');
      router.push('/dashboard/admin/users');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) {
      toast.success('🗑️ Deleted successfully');
      router.push('/dashboard/admin/users');
    }
  };

  if (loading) return <AdminLayout><div className="p-4 text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Head><title>Edit User | Admin</title></Head>
      <div className="container py-4 text-white">
        <h1 className="display-6 mb-4">Edit User</h1>

        <form onSubmit={handleSubmit} className="bg-dark p-4 border rounded">
          {['name', 'company_name', 'email', 'address', 'postcode', 'eori_number'].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label text-capitalize">{field.replace('_', ' ')}</label>
              <input
                type="text"
                name={field}
                className="form-control"
                value={form[field]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Account Type</label>
            <select name="account_type" className="form-select" value={form.account_type} onChange={handleChange}>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">New Password (optional)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current"
            />
          </div>

          {['approved', 'banned', 'has_paid'].map((flag) => (
            <div className="form-check form-switch mb-2" key={flag}>
              <input
                className="form-check-input"
                type="checkbox"
                name={flag}
                checked={form[flag]}
                onChange={handleChange}
              />
              <label className="form-check-label">{flag.replace('_', ' ')}</label>
            </div>
          ))}

          <button type="submit" className="btn btn-warning w-100 fw-bold mb-3">Save Changes</button>
          <button type="button" className="btn btn-danger w-100 fw-bold" onClick={handleDelete}>
            Delete User
          </button>
        </form>

        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </AdminLayout>
  );
}
