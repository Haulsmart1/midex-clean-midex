'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);

    if (res?.error) {
      setError('Login failed. Please try again.');
      return;
    }

    // Wait a moment for the session to update
    setTimeout(async () => {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      const role = session?.user?.role?.toLowerCase();

      if (!role) {
        setError("Login succeeded but session could not be established. Please try again.");
        return;
      }
      if (role === 'currys_admin') router.replace('/dashboard/currys');
      else if (role === 'super_admin') router.replace('/dashboard/admin/super');
      else if (role === 'admin') router.replace('/dashboard/admin');
      else if (role === 'forwarder') router.replace('/dashboard/forwarder');
      else if (role === 'user') router.replace('/dashboard/users');
      else router.replace('/dashboard'); // fallback
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: "url('/midex7.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className="d-flex align-items-center justify-content-center text-white"
    >
      <div
        className="p-5 rounded shadow"
        style={{
          width: '300px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <h2 className="mb-4 text-center">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-3">
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
              aria-label="Email"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              aria-label="Password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
