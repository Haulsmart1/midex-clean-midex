import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditAdminPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    role: 'admin',
    password: ''
  });

  useEffect(() => {
    if (id) fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        name,
        email,
        phone,
        position,
        admins ( role )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('❌ Failed to load admin');
    } else {
      setForm({
        ...data,
        role: data.admins?.role || 'admin',
        password: ''
      });
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updates = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      position: form.position
    };

    if (form.password) {
      updates.password = await bcrypt.hash(form.password, 10);
    }

    const { error: empError } = await supabase.from('employees').update(updates).eq('id', id);
    const { error: roleError } = await supabase
      .from('admins')
      .update({ role: form.role })
      .eq('employee_id', id);

    if (empError || roleError) {
      toast.error('❌ Failed to update admin');
    } else {
      toast.success('✅ Admin updated');
      router.push('/dashboard/admin/admins');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
      toast.success('🗑️ Admin deleted');
      router.push('/dashboard/admin/admins');
    }
  };

  if (loading) return <AdminLayout><div className="p-4 text-white">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Head><title>Edit Admin | Admin Panel</title></Head>
      <div className="container py-4 text-white">
        <h1 className="display-6 mb-4">Edit Admin</h1>

        <form onSubmit={handleSubmit} className="bg-dark p-4 border rounded">
          {['name', 'email', 'phone', 'position'].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label text-capitalize">{field}</label>
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
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
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

          <button type="submit" className="btn btn-warning w-100 fw-bold mb-3">Save Changes</button>
          <button type="button" className="btn btn-danger w-100 fw-bold" onClick={handleDelete}>Delete Admin</button>
        </form>

        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </AdminLayout>
  );
}
