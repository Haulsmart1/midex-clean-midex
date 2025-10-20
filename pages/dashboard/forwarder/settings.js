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
      .eq('creator_id', session.user.id);

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
      .insert([{ ...newUser, creator_id: session?.user?.id }]);

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
      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <ToastContainer />
        <h1
          style={{
            color: "#ff7ee2",
            marginBottom: "2rem",
            fontWeight: 700,
            textAlign: "center",
            textShadow: "0 0 18px rgba(255, 126, 226, 0.7)"
          }}
        >
          🛠️ Forwarder Settings
        </h1>

        {/* Add user card */}
        <div className="neon-card p-4 mb-4">
          <h3 style={{ marginBottom: "1rem", color: "#0af" }}>Add Internal User</h3>
          <input
            className="form-control neon-input mb-3"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
          />
          <input
            className="form-control neon-input mb-3"
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
          />
          <select
            className="form-select neon-input mb-3"
            value={newUser.role}
            onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn neon-btn neon-secondary" onClick={addUser}>➕ Add User</button>
        </div>

        {/* Users list card */}
        <div className="neon-card p-4">
          <h3 style={{ marginBottom: "1rem", color: "#0af" }}>Existing Users</h3>
          {users.length === 0 && <p>No users yet.</p>}
          <ul className="list-group">
            {users.map((u) => (
              <li
                key={u.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                <span>{u.name} — <em>{u.role}</em></span>
                <button className="btn neon-btn neon-primary btn-sm" onClick={() => deleteUser(u.id)}>❌ Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Neon styles */}
      <style jsx>{`
        .neon-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          border: 1px solid rgba(255, 126, 226, 0.25);
          box-shadow: 0 0 25px rgba(157, 107, 255, 0.2),
                      0 0 45px rgba(0, 212, 255, 0.15);
        }
        .neon-input {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 126, 226, 0.35);
          color: #f5f5f5;
          padding: 0.55rem 0.9rem;
          border-radius: 10px;
        }
        .neon-btn {
          font-weight: 600;
          border-radius: 10px;
          padding: 0.55rem 1rem;
          border: none;
          transition: all 0.25s ease;
        }
        .neon-primary {
          background: linear-gradient(90deg, #ff7ee2, #9d6bff);
          color: #fff;
        }
        .neon-primary:hover {
          box-shadow: 0 0 15px #ff7ee2aa;
        }
        .neon-secondary {
          background: linear-gradient(90deg, #13f1fc, #45ffc2);
          color: #091821;
        }
        .neon-secondary:hover {
          box-shadow: 0 0 15px #13f1fcaa;
        }
      `}</style>
    </ForwarderLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
