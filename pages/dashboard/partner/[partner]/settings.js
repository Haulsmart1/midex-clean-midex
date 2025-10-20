'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Partner config loader
const configs = {
  atech: () => import('@/components/partners/atechConfig'),
  fastfreight: () => import('@/components/partners/fastfreightConfig'),
  bond: () => import('@/components/partners/bondConfig'),
  tcr: () => import('@/components/partners/tcrConfig'),
  alptrans: () => import('@/components/partners/alptransConfig'),
  '247despatch': () => import('@/components/partners/247despatchConfig'),
  despatch247: () => import('@/components/partners/247despatchConfig'), // alias
  dwcook: () => import('@/components/partners/dwcookConfig'),
};

const fallbackConfig = {
  name: 'Partner',
  primaryColor: '#0065bd',
  coverageAreas: [],
};

export default function PartnerSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const partner = params?.partner?.toLowerCase();

  const [config, setConfig] = useState(null);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('partner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load partner config dynamically
  useEffect(() => {
    if (!partner) return;

    const loadConfig = async () => {
      try {
        if (!configs[partner]) {
          console.warn(`Unknown partner: ${partner}`);
          setConfig(fallbackConfig);
          return;
        }

        const mod = await configs[partner]();
        setConfig(mod?.default || fallbackConfig);
      } catch (err) {
        console.error(`Error loading config for partner "${partner}"`, err);
        setConfig(fallbackConfig);
      }
    };

    loadConfig();
  }, [partner]);

  useEffect(() => {
    if (status === 'loading' || !config) return;
    if (!session) {
      router.replace('/login');
      return;
    }

    fetchUsers();
  }, [session, status, config]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, partner_type')
      .eq('partner_type', partner)
      .order('email', { ascending: true });

    if (error) setError(error.message);
    else setUsers(data || []);
    setLoading(false);
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, partner_type: partner }),
      });

      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('User invited! They’ll receive an email.');
        setEmail('');
        setName('');
        setRole('partner');
        await fetchUsers();
      }
    } catch {
      setError('Server error');
    }

    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();
      if (result.error) setError(result.error);
      else await fetchUsers();
    } catch {
      setError('Server error');
    }

    setLoading(false);
  };

  if (!config) {
    return (
      <div style={{ padding: '3rem', color: '#fff', textAlign: 'center' }}>
        <div className="spinner-border text-light" role="status" style={{ marginBottom: 16 }}></div>
        <div>Loading settings...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(120deg, #0c1628 60%, ${config.primaryColor} 100%)`,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        padding: '3rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => router.push(`/dashboard/partner/${partner}`)}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              background: '#1e2b40',
              color: '#fff',
              border: '1px solid #3a3f5c',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              background: '#e03c3c',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>

        {/* Title */}
        <h1
          style={{
            color: '#ffc600',
            fontWeight: 800,
            fontSize: 30,
            textAlign: 'center',
          }}
        >
          {config.name} Settings
        </h1>

        {/* Invite Form */}
        <div
          style={{
            background: '#1e1e33',
            padding: 28,
            borderRadius: 12,
            boxShadow: '0 0 12px #0003',
          }}
        >
          <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: 13,
                borderRadius: 8,
                border: '1px solid #444',
                background: '#111827',
                color: '#fff',
              }}
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: 13,
                borderRadius: 8,
                border: '1px solid #444',
                background: '#111827',
                color: '#fff',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  padding: 13,
                  borderRadius: 8,
                  background: '#111827',
                  color: '#fff',
                  border: '1px solid #444',
                  flex: 1,
                }}
              >
                <option value="partner">Partner</option>
                <option value="user">User</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: config.primaryColor,
                  border: 'none',
                  color: '#000',
                  padding: '13px 22px',
                  fontWeight: 700,
                  borderRadius: 8,
                  width: 120,
                  cursor: 'pointer',
                }}
              >
                Invite
              </button>
            </div>
          </form>
          {error && <p style={{ color: '#ff5e5e', marginTop: 12 }}>{error}</p>}
          {success && <p style={{ color: '#36fba1', marginTop: 12 }}>{success}</p>}
        </div>

        {/* Users List */}
        <div
          style={{
            background: '#2a2a44',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 0 12px #0003',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: 18 }}>Existing Users</h3>
          {loading ? (
            <div>Loading users…</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {users.map((user) => (
                <li
                  key={user.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: '#1d1d2e',
                    marginBottom: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    {user.email}{' '}
                    <span style={{ color: '#00d0ff', fontWeight: 600 }}>({user.role})</span>
                  </span>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      background: '#e03c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
