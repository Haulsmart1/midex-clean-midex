'use client';

import { useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div style={{ minHeight: '100vh', background: "linear-gradient(rgba(3, 9, 18, 0.62), rgba(3, 9, 18, 0.85)), url('/midex7.jpg') center / cover no-repeat", color: '#fff' }}>
      <nav aria-label="Main navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '16px clamp(18px, 5vw, 64px)', background: 'rgba(0,0,0,.72)', borderBottom: '1px solid rgba(255,255,255,.16)' }}>
        <Link href="/" style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', textDecoration: 'none', letterSpacing: '.04em' }}>MIDNIGHT EXPRESS</Link>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-outline-light fw-bold">Home</Link>
          <Link href="/contact" className="btn btn-outline-light fw-bold">Freight enquiries</Link>
        </div>
      </nav>
      <main style={{ minHeight: 'calc(100vh - 86px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px 64px' }}>
        <section aria-labelledby="login-heading" style={{ width: '100%', maxWidth: 480, padding: 'clamp(24px, 6vw, 44px)', background: 'rgba(5, 12, 26, .90)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 18, boxShadow: '0 18px 55px rgba(0,0,0,.45)' }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.2em', fontWeight: 700, color: '#b9d9ef', marginBottom: 12 }}>Secure customer access</p>
          <h1 id="login-heading" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.3rem)', fontWeight: 800, marginBottom: 12 }}>Welcome back</h1>
          <p style={{ color: '#d5dce7', lineHeight: 1.6, marginBottom: 24 }}>Existing Midnight Express customers can sign in with a secure link sent to their email. No password needed.</p>
          {error && <div className="alert alert-danger" role="alert" aria-live="polite">{error}</div>}
          {notice && <div className="alert alert-info" role="status" aria-live="polite">{notice}</div>}
          <form onSubmit={(event) => { event.preventDefault(); if (!loading) requestMagicLink(); }}>
            <label htmlFor="midnight-login-email" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Email address</label>
            <input id="midnight-login-email" type="email" name="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" inputMode="email" required autoFocus disabled={loading} style={{ minHeight: 48, width: '100%' }} />
            <button type="submit" className="btn btn-light w-100 fw-bold" style={{ minHeight: 48, marginTop: 18 }} disabled={loading || !email.trim()}>{loading ? 'Requesting link…' : 'Email me a sign-in link'}</button>
          </form>
          <p style={{ color: '#cbd4df', fontSize: '.9rem', lineHeight: 1.5, marginTop: 20, marginBottom: 0 }}>Not registered, or having trouble signing in? <Link href="/contact" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }}>Contact our freight team</Link>.</p>
        </section>
      </main>
    </div>
  );
}
