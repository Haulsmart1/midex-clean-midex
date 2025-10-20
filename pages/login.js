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

      // Wait briefly for session to be populated
      await new Promise((res) => setTimeout(res, 300));

      const response = await fetch('/api/auth/session');
      const session = await response.json();

      const rawRole = session?.user?.role;
      const rawRoles = session?.user?.roles;
      const partner = session?.user?.partner_type?.toLowerCase?.().trim();

      const normalizedRole = rawRole?.toLowerCase?.().trim();
      let normalizedRoles = Array.isArray(rawRoles)
        ? rawRoles.map((r) => r?.toLowerCase?.().trim()).filter(Boolean)
        : [];

      if (normalizedRole && !normalizedRoles.includes(normalizedRole)) {
        normalizedRoles.push(normalizedRole);
      }

      // Map aliases like "users" to "user"
      normalizedRoles = normalizedRoles.map((r) => (r === 'users' ? 'user' : r));

      // DEBUG (optional)
      console.log('✅ Normalized roles:', normalizedRoles);

      if (normalizedRoles.includes('currys_admin')) {
        router.replace('/dashboard/currys');
      } else if (normalizedRoles.includes('super_admin')) {
        router.replace('/dashboard/admin/super');
      } else if (normalizedRoles.includes('admin')) {
        router.replace('/dashboard/admin');
      } else if (normalizedRoles.includes('forwarder')) {
        router.replace('/dashboard/forwarder');
      } else if (normalizedRoles.includes('customs_agent')) {
        router.replace('/dashboard/customs');
      } else if (normalizedRoles.includes('user')) {
        router.replace('/dashboard/user');
      } else if (normalizedRoles.includes('partner')) {
        if (partner) {
          router.replace(`/dashboard/partner/${partner}`);
        } else {
          router.replace('/dashboard/partner');
        }
      } else {
        setError('Login succeeded but no valid role assigned. Please contact support.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      setError('Unexpected error. Please try again later.');
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
          <div className="alert alert-danger" aria-live="polite" role="alert">
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
