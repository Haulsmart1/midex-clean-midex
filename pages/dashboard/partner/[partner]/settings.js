'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const configs = {
  atech: () => import('@/components/partners/atechConfig'),
  fastfreight: () => import('@/components/partners/fastFreightConfig'),
  bond: () => import('@/components/partners/bondConfig'),
  tcr: () => import('@/components/partners/tcrConfig'),
  alptrans: () => import('@/components/partners/alptransConfig'),
  despatch247: () => import('@/components/partners/despatch247Config'),
  dwcook: () => import('@/components/partners/dwcookConfig'),
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

  // Load partner config
  useEffect(() => {
    if (partner && configs[partner]) {
      configs[partner]().then(mod => setConfig(mod.default));
    }
  }, [partner]);

  useEffect(() => {
    if (status === "loading" || !config) return;
    if (!session) return router.replace('/login');
    fetchUsers();
  }, [session, status, config, router]);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, partner_type')
      .eq('partner_type', partner)
      .order('email', { ascending: true });
    if (error) setError(error.message);
    setUsers(data || []);
    setLoading(false);
  }

  async function handleInviteUser(e) {
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
      if (result.error) setError(result.error);
      else {
        setEmail(''); setName(''); setRole('partner');
        setSuccess("User invited! They'll receive an email to complete registration.");
        await fetchUsers();
      }
    } catch (err) {
      setError('Server error');
    }
    setLoading(false);
  }

  // 🟢 NEW DELETE USER FUNCTION (API ROUTE)
  async function handleDeleteUser(userId) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      const result = await res.json();
      if (result.error) setError(result.error);
      else await fetchUsers();
    } catch {
      setError('Server error');
    }
    setLoading(false);
  }

  if (!config) return <div style={{ color: '#fff', padding: 30 }}>Loading settings...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(120deg, #0c1628 60%, ${config.primaryColor} 100%)`,
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '3rem 1rem'
    }}>
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 36
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16
        }}>
          <button
            onClick={() => router.push(`/dashboard/partner/${partner}`)}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              background: '#1e2b40',
              color: '#fff',
              fontWeight: 700,
              border: '1px solid #3a3f5c',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              padding: '10px 22px',
              borderRadius: 8,
              background: '#fb4141',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>

        <h1 style={{
          color: '#ffc600',
          fontWeight: 800,
          fontSize: 32,
          marginBottom: 12,
          textAlign: 'center'
        }}>
          {config.name} Settings
        </h1>

        {/* Invite User Form */}
        <div style={{
          background: '#201a38',
          borderRadius: 14,
          padding: '28px 30px 24px 30px',
          margin: '0 auto',
          boxShadow: '0 2px 18px #0001',
          width: '100%'
        }}>
          <h3 style={{ fontSize: 20, marginBottom: 18, textAlign: 'center' }}>Invite User</h3>
          <form onSubmit={handleInviteUser} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <input type="email" placeholder="Email" value={email} disabled={loading}
              onChange={e => setEmail(e.target.value)} required
              style={{ padding: 13, borderRadius: 8, border: '1px solid #444', background: '#15102b', color: '#fff', width: '100%' }} />
            <input type="text" placeholder="Name" value={name} disabled={loading}
              onChange={e => setName(e.target.value)} required
              style={{ padding: 13, borderRadius: 8, border: '1px solid #444', background: '#15102b', color: '#fff', width: '100%' }} />
            <div style={{ display: 'flex', gap: 13 }}>
              <select value={role} onChange={e => setRole(e.target.value)} disabled={loading}
                style={{ padding: 13, borderRadius: 8, background: '#15102b', color: '#fff', border: '1px solid #444', width: '100%' }}>
                <option value="partner">Partner</option>
                <option value="user">User</option>
              </select>
              <button type="submit" disabled={loading} style={{
                padding: '13px 0',
                borderRadius: 8,
                background: config.primaryColor,
                color: '#232323',
                border: 'none',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                width: 130
              }}>
                Invite
              </button>
            </div>
          </form>
          <div style={{ minHeight: 32, marginTop: 8 }}>
            {error &&
              <div style={{
                color: '#fb4141',
                textAlign: 'center',
                fontWeight: 600,
                background: '#211',
                borderRadius: 5,
                padding: '8px 0',
                marginTop: 6,
              }}>{error}</div>
            }
            {success &&
              <div style={{
                color: '#11cf83',
                textAlign: 'center',
                fontWeight: 600,
                background: '#021',
                borderRadius: 5,
                padding: '8px 0',
                marginTop: 6,
              }}>{success}</div>
            }
          </div>
        </div>

        {/* Users List */}
        <div style={{
          background: '#432d7a',
          borderRadius: 14,
          padding: '22px 30px',
          margin: '0 auto',
          boxShadow: '0 2px 18px #0001',
          width: '100%'
        }}>
          <h3 style={{ fontSize: 20, marginBottom: 14, textAlign: 'center' }}>Users</h3>
          {loading ? <div>Loading...</div> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {users.map(user => (
                <li key={user.id} style={{
                  marginBottom: 15,
                  background: '#34266c',
                  borderRadius: 8,
                  padding: '13px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>
                    {user.email}
                    <span style={{ color: '#ffc600', marginLeft: 14, fontWeight: 700 }}>
                      {user.role}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 9 }}>
                    <button onClick={() => handleDeleteUser(user.id)} disabled={loading}
                      style={{
                        background: '#ff006d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer'
                      }}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
