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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      setLoading(false);

      if (res?.error) {
        setError(res.error || 'Login failed. Please try again.');
        return;
      }

      // Wait for session propagation (NextAuth edge case)
      await new Promise(res => setTimeout(res, 300));

      const response = await fetch('/api/auth/session');
      const session = await response.json();
      // Parse role(s) robustly
      let role = session?.user?.role?.toLowerCase();
      let roles = Array.isArray(session?.user?.roles)
        ? session.user.roles.map(r => r.toLowerCase())
        : role ? [role] : [];

      // Prefer roles array if available
      const allRoles = roles.length ? roles : [role];

      if (!allRoles.length) {
        setError("Login succeeded but session could not be established. Please try again.");
        return;
      }

      if (allRoles.includes('currys_admin')) router.replace('/dashboard/currys');
      else if (allRoles.includes('super_admin')) router.replace('/dashboard/admin/super');
      else if (allRoles.includes('admin')) router.replace('/dashboard/admin');
      else if (allRoles.includes('forwarder')) router.replace('/dashboard/forwarder');
      else if (allRoles.includes('user')) router.replace('/dashboard/users');
      else if (allRoles.includes('partner')) router.replace('/dashboard/partner');
      else router.replace('/dashboard');
    } catch (err) {
      setLoading(false);
      setError('Unexpected error. Please try again later.');
      console.error(err);
    }
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
        {error && (
          <div className="alert alert-danger" aria-live="polite">
            {error}
          </div>
        )}
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

