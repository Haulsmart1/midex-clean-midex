import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { generatePassword } from '@/utils/generatePassword';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateAdmin() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    role: 'admin',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawPassword = form.password || generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const { data: employee, error: empError } = await supabase
      .from('employees')
      .insert([{
        name: form.name,
        email: form.email,
        phone: form.phone,
        position: form.position,
        password: hashedPassword
      }])
      .select()
      .single();

    if (empError || !employee) {
      toast.error('❌ Failed to create employee');
      return;
    }

    const { error: adminError } = await supabase
      .from('admins')
      .insert([{
        employee_id: employee.id,
        role: form.role
      }]);

    if (adminError) {
      toast.error('❌ Failed to create admin record');
    } else {
      toast.success(`✅ Admin Created. Password: ${rawPassword}`);
      router.push('/dashboard/admin/admins');
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Create Admin | Admin Panel</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-6 mb-4 fw-bold">Add New Admin</h1>

        <form onSubmit={handleSubmit} className="bg-dark p-4 rounded border">
          {['name', 'email', 'phone', 'position'].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label text-capitalize">{field}</label>
              <input
                type="text"
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
            <label className="form-label">Password (optional)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Leave blank to auto-generate"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-outline-light w-100 fw-bold">
            Create Admin
          </button>
        </form>

        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </AdminLayout>
  );
}
