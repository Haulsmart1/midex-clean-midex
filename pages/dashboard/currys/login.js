'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CurrysLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      setError('Login failed. Please check your credentials.');
      return;
    }

    router.replace('/dashboard/currys'); // or wherever you want admins to land
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #552e8c 80%, #ffc600 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 22,
        boxShadow: '0 8px 48px #552e8c55',
        padding: '54px 48px 38px 48px',
        width: 410,
        maxWidth: '98vw'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <img src="/brand-currys-logo.svg" alt="Currys" style={{ width: 92, height: 92 }} />
        </div>
        <h2 style={{
          color: '#552e8c',
          fontWeight: 900,
          fontSize: 30,
          marginBottom: 10,
          letterSpacing: '.02em',
          textAlign: 'center'
        }}>
          Currys Admin Login
        </h2>
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <input
            type="email"
            placeholder="Email"
            required
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 13px',
              marginBottom: 18,
              borderRadius: 8,
              border: '1.5px solid #eee',
              fontSize: 17,
              color: '#552e8c'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 13px',
              marginBottom: 24,
              borderRadius: 8,
              border: '1.5px solid #eee',
              fontSize: 17,
              color: '#552e8c'
            }}
          />
          {error && (
            <div style={{
              color: '#e52e00',
              background: '#fff5f2',
              border: '1px solid #ffc7b5',
              borderRadius: 6,
              padding: '10px 12px',
              marginBottom: 10,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#ffc600',
              color: '#552e8c',
              fontWeight: 800,
              fontSize: 18,
              padding: '15px 0',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 1px 12px #ffc6003b'
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div style={{
          color: '#aaa',
          fontSize: 13,
          marginTop: 28,
          textAlign: 'center',
        }}>
          &copy; {new Date().getFullYear()} Currys Admin &nbsp;|&nbsp; <span style={{ color: '#552e8c', fontWeight: 600 }}>lithiumbattery.app</span>
        </div>
      </div>
    </div>
  );
}
