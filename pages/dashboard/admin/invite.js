import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function InviteDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState('forwarders');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setRecords(data);
      setLoading(false);
    };

    fetchData();
  }, [table]);

  const resendInvite = async (email, token) => {
    const link = `${window.location.origin}/set-password?token=${token}`;
    await fetch('/api/send-invite', {
      method: 'POST',
      body: JSON.stringify({ email, link }),
    });
    setMsg(`📤 Invite re-sent to ${email}`);
    setTimeout(() => setMsg(''), 4000);
  };

  const revokeToken = async (id) => {
    const { error } = await supabase
      .from(table)
      .update({ reset_token: null, reset_token_expires: null })
      .eq('id', id);

    if (!error) {
      setRecords(records.map((r) => (r.id === id ? { ...r, reset_token: null } : r)));
      setMsg('🚫 Token revoked');
      setTimeout(() => setMsg(''), 4000);
    } else {
      setMsg('❌ Revoke failed: ' + error.message);
    }
  };

  const copyLink = (token) => {
    const link = `${window.location.origin}/set-password?token=${token}`;
    navigator.clipboard.writeText(link);
    setMsg('🔗 Link copied to clipboard');
    setTimeout(() => setMsg(''), 3000);
  };

  const statusBadge = (r) => {
    if (!r.reset_token) return <span style={{ color: 'green' }}>✅ Used</span>;
    const isExpired = new Date(r.reset_token_expires) < new Date();
    return isExpired ? (
      <span style={{ color: 'orange' }}>⏰ Expired</span>
    ) : (
      <span style={{ color: 'blue' }}>🔐 Pending</span>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2>Invite Tracker</h2>
      <label>View Table:</label>{' '}
      <select value={table} onChange={(e) => setTable(e.target.value)}>
        <option value="forwarders">Forwarders</option>
        <option value="users">Users</option>
        <option value="employees">Employees</option>
      </select>

      {msg && <p style={{ color: '#0070f3', marginTop: 10 }}>{msg}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Token</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const email = r.contact_email || r.email;
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #ccc' }}>
                  <td>{r.name}</td>
                  <td>{email}</td>
                  <td>{statusBadge(r)}</td>
                  <td style={{ fontSize: '0.75em' }}>
                    {r.reset_token?.slice(0, 12) || '—'}
                  </td>
                  <td>
                    {r.reset_token && (
                      <>
                        <button onClick={() => copyLink(r.reset_token)}>📋 Copy</button>{' '}
                        <button onClick={() => resendInvite(email, r.reset_token)}>📤 Resend</button>{' '}
                        <button onClick={() => revokeToken(r.id)}>❌ Revoke</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
