import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import AdminLayout from '../../../../components/layouts/AdminLayout';

export default function CreateForwarder() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', contact_email: '', contact_phone: '', password: '', notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashed = await bcrypt.hash(form.password, 10);
    const { error } = await supabase.from('forwarders').insert([{ ...form, password: hashed }]);
    if (error) return toast.error(error.message);
    toast.success('Forwarder created!');
    router.push('/dashboard/admin/forwarders');
  };

  return (
    <AdminLayout>
      <h2 className="text-white">Add New Forwarder</h2>
      <form onSubmit={handleSubmit} className="text-white">
        {['name', 'contact_email', 'contact_phone', 'password', 'notes'].map(field => (
          <div key={field} className="mb-3">
            <label className="form-label">{field.replace('_', ' ')}</label>
            <input className="form-control" name={field} type={field === 'password' ? 'password' : 'text'} required onChange={handleChange} />
          </div>
        ))}
        <button className="btn btn-primary w-100">Create Forwarder</button>
      </form>
    </AdminLayout>
  );
}
