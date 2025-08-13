'use client';
import { useEffect, useState } from 'react';
import UserLayout from '@/components/layouts/UsersLayout'; // <-- swap for your actual layout
import { supabase } from '@/lib/supabaseClient';
import { useSession } from 'next-auth/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // 1. Load current user data
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', session.user.id)
        .single();
      if (error) toast.error('Could not fetch user profile');
      else setForm({ name: data?.name || '', email: data?.email || '' });
      setLoading(false);
    }
    fetchProfile();
  }, [session?.user?.id]);

  // 2. Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // -- Update name/email
    const { error } = await supabase
      .from('users')
      .update({ name: form.name, email: form.email })
      .eq('id', session.user.id);

    // -- Optionally update password
    let passwordError = null;
    if (password) {
      if (password !== confirm) {
        toast.error("Passwords do not match!");
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        setLoading(false);
        return;
      }
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) passwordError = pwError.message;
    }

    setLoading(false);
    if (error) toast.error('Update failed: ' + error.message);
    else if (passwordError) toast.error('Password update failed: ' + passwordError);
    else toast.success('Profile updated!');
  };

  return (
    <UserLayout>
      <ToastContainer />
      <div className="container py-5 text-white" style={{ maxWidth: 480 }}>
        <h1 className="mb-4">👤 My Account Settings</h1>
        <form onSubmit={handleUpdate}>
          <div className="mb-3">
            <label>Name</label>
            <input
              className="form-control"
              value={form.name}
              disabled={loading}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              disabled={loading}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              disabled={loading}
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
          </div>
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              minLength={8}
              disabled={loading}
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}

