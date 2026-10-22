'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const routeSession = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    const rawRole = session?.user?.role;
    const rawRoles = session?.user?.roles;
    const partner = session?.user?.partner_type?.toLowerCase?.().trim();
    const normalizedRole = rawRole?.toLowerCase?.().trim();
    let normalizedRoles = Array.isArray(rawRoles)
      ? rawRoles.map((role) => role?.toLowerCase?.().trim()).filter(Boolean)
      : [];

    if (normalizedRole && !normalizedRoles.includes(normalizedRole)) normalizedRoles.push(normalizedRole);
    normalizedRoles = normalizedRoles.map((role) => (role === 'users' ? 'user' : role));

    if (normalizedRoles.includes('currys_admin')) router.replace('/dashboard/currys');
    else if (normalizedRoles.includes('super_admin')) router.replace('/dashboard/admin/super');
    else if (normalizedRoles.includes('admin')) router.replace('/dashboard/admin');
    else if (normalizedRoles.includes('forwarder')) router.replace('/dashboard/forwarder');
    else if (normalizedRoles.includes('customs_agent')) router.replace('/dashboard/customs');
    else if (normalizedRoles.includes('user')) router.replace('/dashboard/user');
    else if (normalizedRoles.includes('partner')) router.replace(partner ? `/dashboard/partner/${partner}` : '/dashboard/partner');
    else setError('Login succeeded but no valid role is assigned. Please contact support.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) setError(result.error || 'Login failed. Please try again.');
      else await routeSession();
    } catch {
      setError('Unexpected error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const requestMagicLink = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      const { error: requestError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/magic-link`,
        },
      });
      if (requestError) setError('We could not send a sign-in link. Please contact support.');
      else setNotice('If this email belongs to an approved Midnight account, a one-time sign-in link is on its way.');
    } catch {
      setError('We could not send a sign-in link. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundImage: "url('/midex7.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} className="d-flex align-items-center justify-content-center text-white">
      <div className="p-5 rounded shadow" style={{ width: '320px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
        <h2 className="mb-4 text-center">Existing customer login</h2>
        {error && <div className="alert alert-danger" aria-live="polite" role="alert">{error}</div>}
        {notice && <div className="alert alert-success" aria-live="polite" role="status">{notice}</div>}
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-3">
            <input type="email" placeholder="Email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus disabled={loading} aria-label="Email" />
          </div>
          <div className="mb-3">
            <input type="password" placeholder="Password" className="form-control" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} aria-label="Password" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading || !password}>
            {loading ? 'Please wait…' : 'Login with password'}
          </button>
          <button type="button" className="btn btn-outline-light w-100 mt-3" disabled={loading} onClick={requestMagicLink}>
            Email me a sign-in link
          </button>
        </form>
      </div>
    </div>
  );
}
