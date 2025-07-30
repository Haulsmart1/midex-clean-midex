'use client';
import { useEffect, useState } from 'react';
import ForwarderLayout from '@/components/layouts/ForwarderLayout';
import { supabase } from '@/lib/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSession } from 'next-auth/react';

export default function ForwarderSettings() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });

  const fetchUsers = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('internal_users')
      .select('*')
      .eq('creator_id', session.user.id); // ✅ use RLS filter if needed

    if (error) {
      console.error('🔴 Supabase fetch error:', error);
      toast.error('Failed to load users');
    } else {
      setUsers(data);
    }
  };

  const addUser = async () => {
    const { error } = await supabase
      .from('internal_users')
      .insert([{ ...newUser, creator_id: session?.user?.id }]); // ✅ include user for RLS

    if (error) {
      toast.error('Error adding user');
    } else {
      toast.success('User added');
      setNewUser({ name: '', email: '', role: 'viewer' });
      fetchUsers();
    }
  };

  const deleteUser = async (id) => {
    const { error } = await supabase.from('internal_users').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else {
      toast.success('User deleted');
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session?.user?.id]);

  return (
    <ForwarderLayout>
      <div className="container py-4 text-white"> {/* ✅ CONTAINER FIX */}
        <ToastContainer />
        <h1 className="mb-4">🛠️ Forwarder Settings</h1>

        <div className="mb-4 bg-dark p-3 rounded">
          <h3>Add Internal User</h3>
          <input
            className="form-control mb-2"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
          />
          <input
            className="form-control mb-2"
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
          />
          <select
            className="form-select mb-2"
            value={newUser.role}
            onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn btn-success" onClick={addUser}>➕ Add User</button>
        </div>

        <div className="bg-dark p-3 rounded">
          <h3>Existing Users</h3>
          {users.length === 0 && <p>No users yet.</p>}
          <ul className="list-group">
            {users.map((u) => (
              <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{u.name} — <em>{u.role}</em></span>
                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ForwarderLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
