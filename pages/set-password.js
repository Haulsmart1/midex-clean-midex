import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';

export default function SetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [record, setRecord] = useState(null);
  const [table, setTable] = useState('');

  // Step 1: Check all 3 tables for token
  useEffect(() => {
    if (!token) return;
    const checkTables = async () => {
      const tables = ['forwarders', 'users', 'employees'];
      for (const tbl of tables) {
        const { data } = await supabase
          .from(tbl)
          .select('*')
          .eq('reset_token', token)
          .gt('reset_token_expires', new Date().toISOString())
          .maybeSingle();
        if (data) {
          setRecord(data);
          setTable(tbl);
          return;
        }
      }
    };
    checkTables();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setStatus('❌ Passwords do not match.');

    const hash = await argon2.hash({ pass: password, salt: 'midex-salt' });

    const { error } = await supabase
      .from(table)
      .update({
        password: hash.encoded,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('id', record.id);

    if (error) return setStatus('❌ Error: ' + error.message);

    setStatus('✅ Password set! Redirecting...');
    setTimeout(() => router.push('/login'), 2000);
  };

  if (!token) return <p>Missing token</p>;
  if (!record) return <p>Validating token...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>Set Your Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <button type="submit">Save Password</button>
      <p>{status}</p>
    </form>
  );
}
