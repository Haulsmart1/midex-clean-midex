// pages/dashboard/users/settings.js

import Head from 'next/head';
import UserLayout from '@/components/layouts/UsersLayout';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // ✅ Make sure this path matches your setup
import { useSession } from 'next-auth/react';

export default function UserSettings() {
  const { data: session } = useSession();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleProfileChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('users')
      .update({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      })
      .eq('id', session.user.id);

    if (error) {
      setMessage('❌ Failed to update profile.');
    } else {
      setMessage('✅ Profile updated successfully.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('users')
      .update({ password: passwords.newPassword }) // ⚡ Ideally hash the password before sending
      .eq('id', session.user.id);

    if (error) {
      setMessage('❌ Failed to change password.');
    } else {
      setMessage('✅ Password changed successfully.');
    }
  };

  return (
    <UserLayout>
      <Head>
        <title>Account Settings | Midnight Express</title>
      </Head>

      <div className="container py-4 text-white">
        <h1 className="display-5 fw-bold mb-4 text-center">Account Settings</h1>

        {message && <div className="alert alert-info">{message}</div>}

        {/* Profile Update Form */}
        <form onSubmit={handleProfileSubmit} className="mb-5" style={{ maxWidth: '500px', margin: 'auto' }}>
          <h4 className="text-center mb-4">Update Profile</h4>

          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control bg-dark text-white border-light"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control bg-dark text-white border-light"
              value={profile.email}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-control bg-dark text-white border-light"
              value={profile.phone}
              onChange={handleProfileChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-control bg-dark text-white border-light"
              value={profile.address}
              onChange={handleProfileChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Save Changes
          </button>
        </form>

        {/* Password Change Form */}
        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px', margin: 'auto' }}>
          <h4 className="text-center mb-4">Change Password</h4>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-control bg-dark text-white border-light"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control bg-dark text-white border-light"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-warning w-100">
            Change Password
          </button>
        </form>
      </div>
    </UserLayout>
  );
}
