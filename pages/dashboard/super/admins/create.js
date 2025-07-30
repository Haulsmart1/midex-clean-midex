// 📁 pages/dashboard/super/admins/create.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';


export default function CreateAdmin() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    position: 'Admin',
    role: 'admin' // default to admin; can be set to 'super_admin'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hashedPassword = await bcrypt.hash(form.password, 10);

      // Step 1: Add to employees table
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .insert([
          {
            name: form.name,
            email: form.email,
            password: hashedPassword,
            phone: form.phone,
            position: form.position
          }
        ])
        .select()
        .single();

      if (empError) throw empError;

      // Step 2: Promote to admin
      const { error: adminError } = await supabase.from('admins').insert([
        {
          employee_id: employee.id,
          role: form.role
        }
      ]);

      if (adminError) throw adminError;

      toast.success(`✅ ${form.role === 'super_admin' ? 'Super Admin' : 'Admin'} created successfully!`);
      router.push('/dashboard/super/admins');

    } catch (err) {
      toast.error(err.message || 'Failed to create admin');
    }
  };

  return (
    <SuperAdminLayout>
      <h1 className="text-white display-6 mb-4">Create New Admin</h1>

      <form onSubmit={handleSubmit} className="bg-dark text-white p-4 rounded shadow border border-secondary">
        {['name', 'email', 'phone', 'password'].map((field) => (
          <div className="mb-3" key={field}>
            <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              className="form-control"
              required
              value={form[field]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100 fw-bold">
          Create Admin
        </button>
      </form>
    </SuperAdminLayout>
  );
}
