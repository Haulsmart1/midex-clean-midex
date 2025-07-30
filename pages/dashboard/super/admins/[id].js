import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import SuperAdminLayout from '../../../../components/layouts/SuperAdminLayout';
import bcrypt from 'bcryptjs';
import { toast } from 'react-toastify';

export default function EditAdminPage() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    role: 'admin',
    password: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, admins(role)')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Admin not found');
      return;
    }

    setForm({
      ...data,
      role: data.admins?.role || 'admin',
      password: ''
    });
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const updates = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      position: form.position
    };

    if (form.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(form.password, salt);
    }

    const { error: empErr } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id);

    const { error: roleErr } = await supabase
      .from('admins')
      .update({ role: form.role })
      .eq('employee_id', id);

    if (empErr || roleErr) {
      toast.error('Update failed');
    } else {
      toast.success('Admin updated');
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
      toast.success('Admin deleted');
      router.push('/dashboard/super/admins');
    }
  };

  if (loading) return <SuperAdminLayout><div className="text-white p-4">Loading...</div></SuperAdminLayout>;

  return (
    <SuperAdminLayout>
      <div className="container py-4 text-white">
        <h1 className="display-6 fw-bold mb-4">Edit Admin</h1>

        <form onSubmit={handleSubmit} className="bg-dark p-4 border rounded shadow-sm">
          {['name', 'email', 'phone', 'position'].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label text-capitalize">{field}</label>
              <input
                className="form-control"
                name={field}
                value={form[field]}
                onChange={handleChange}
                required={field !== 'phone'}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-select">
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">New Password (optional)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button type="submit" className="btn btn-outline-light w-100 fw-bold">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-outline-danger w-100 fw-bold mt-3"
          >
            Delete Admin
          </button>
        </form>
      </div>
    </SuperAdminLayout>
  );
}
