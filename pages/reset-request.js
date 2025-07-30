import { useState } from 'react';
import { supabase } from '/lib/supabaseClient';
import { toast } from 'react-toastify';
import Head from 'next/head';

export default function ResetRequest() {
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://midnight-express.org/reset-password', // <-- Replace with your live link
    });

    if (error) {
      toast.error('Failed to send reset link');
    } else {
      toast.success('Reset link sent to your email');
    }
  };

  return (
    <>
      <Head><title>Reset Password | Midnight Express</title></Head>

      <div className="container py-5 text-white">
        <h1 className="display-6 fw-bold mb-4">Reset Your Password</h1>
        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            placeholder="Enter your email"
            className="form-control mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-outline-light">
            Send Reset Link
          </button>
        </form>
      </div>
    </>
  );
}
