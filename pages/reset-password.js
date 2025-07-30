// 📁 /pages/reset-password.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import Head from 'next/head';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage('Passwords do not match!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error(error);
      setMessage('Error resetting password');
    } else {
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Reset Password | Midnight Express</title>
      </Head>

      <div className="container py-5 text-white">
        <h1 className="fw-bold mb-4 text-center">Reset Your Password</h1>

        <form onSubmit={handleReset} className="mx-auto" style={{ maxWidth: '400px' }}>
          <input
            type="password"
            placeholder="New Password"
            className="form-control mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="form-control mb-3"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" disabled={loading} className="btn btn-warning w-100">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {message && <p className="mt-3 text-center">{message}</p>}
        </form>
      </div>
    </>
  );
}
