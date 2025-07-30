import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import AdminLayout from '../../../../components/layouts/AdminLayout';

export default function CreateUser() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', company_name: '', email: '', password: '', address: '', postcode: '', eori_number: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashed = await bcrypt.hash(form.password, 10);
    const { error } = await supabase.from('users').insert([{ ...form, password: hashed }]);
    if (error) return toast.error(error.message);
    toast.success('User created!');
    router.push('/dashboard/admin/users');
  };

  return (
    <AdminLayout>
      <h2 className="text-white">Add New User</h2>
      <form onSubmit={handleSubmit} className="text-white">
        {['name', 'company_name', 'email', 'password', 'address', 'postcode', 'eori_number'].map(field => (
          <div key={field} className="mb-3">
            <label className="form-label">{field.replace('_', ' ')}</label>
            <input className="form-control" name={field} type={field === 'password' ? 'password' : 'text'} required onChange={handleChange} />
          </div>
        ))}
        <button className="btn btn-primary w-100">Create User</button>
      </form>
    </AdminLayout>
  );
}
