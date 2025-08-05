import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient'; // Adjust path if needed

export default function SetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [session, setSession] = useState(null);

  // Handle Supabase session from invite/magic link
  useEffect(() => {
    const checkSession = async () => {
      // Check for access_token in URL hash
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const hash = window.location.hash.substr(1); // remove '#'
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            setStatus("❌ Could not set session. Try clicking the invite link again.");
            setLoading(false);
            return;
          }
          setSession(data.session);
          setLoading(false);
          return;
        }
      }
      // Fallback: check existing session
      const { data } = await supabase.auth.getSession();
      if (data?.session) setSession(data.session);
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!password || !confirm) {
      setStatus('❌ Both fields are required.');
      return;
    }
    if (password !== confirm) {
      setStatus('❌ Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('❌ ' + error.message);
      setLoading(false);
      return;
    }
    setStatus('✅ Password set! Redirecting...');
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading...</p>;
  if (!session) return <p style={{ textAlign: 'center', marginTop: 80 }}>Session invalid or expired. Please use the most recent link sent to your email.</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '50px auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ textAlign: 'center' }}>Set Your Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        minLength={8}
        autoComplete="new-password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        autoComplete="new-password"
        minLength={8}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>Save Password</button>
      <p style={{ minHeight: 30, textAlign: 'center', color: status.startsWith('✅') ? 'green' : 'red' }}>{status}</p>
    </form>
  );
}
