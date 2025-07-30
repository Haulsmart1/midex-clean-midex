import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

export default function CurrysUserTable({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("currys");
  const [showInvite, setShowInvite] = useState(false);

  const supabase = getSupabaseClient(currentUser?.supabaseAccessToken);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id,email,name,role,status,last_login")
      .in("role", ["currys", "currys_admin"]);
    if (error) toast.error("Failed to load users: " + error.message);
    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleInvite() {
    if (!inviteEmail) return;
    const email = inviteEmail.trim().toLowerCase();
    const { error } = await supabase.from("users").upsert([
      { email, role: inviteRole, status: "invited" }
    ], { onConflict: "email" });
    if (error) toast.error("Invite failed: " + error.message);
    else {
      toast.success("User invited!");
      setInviteEmail(""); setShowInvite(false);
      loadUsers();
    }
  }

  async function handleRoleChange(id, newRole) {
    const { error } = await supabase.from("users").update({ role: newRole }).eq("id", id);
    if (error) toast.error("Role update failed: " + error.message);
    else loadUsers();
  }

  async function handleDeactivate(id) {
    const { error } = await supabase.from("users").update({ status: "inactive" }).eq("id", id);
    if (error) toast.error("Deactivate failed: " + error.message);
    else loadUsers();
  }

  async function handleReactivate(id) {
    const { error } = await supabase.from("users").update({ status: "active" }).eq("id", id);
    if (error) toast.error("Reactivate failed: " + error.message);
    else loadUsers();
  }

  const filtered = users.filter(
    u => !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex mb-2" style={{gap: 12}}>
        <input
          className="form-control"
          placeholder="Search users"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-success" onClick={() => setShowInvite(true)}>
          ➕ Invite User
        </button>
      </div>
      {showInvite && (
        <div className="card mb-3 p-3">
          <h5>Invite User</h5>
          <input
            className="form-control mb-2"
            placeholder="Email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <select
            className="form-select mb-2"
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
          >
            <option value="currys">CSR / Booker</option>
            <option value="currys_admin">Currys Admin</option>
          </select>
          <button className="btn btn-primary me-2" onClick={handleInvite}>
            Send Invite
          </button>
          <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>
            Cancel
          </button>
        </div>
      )}
      <table className="table table-dark table-striped table-bordered">
        <thead>
          <tr>
            <th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>
                <select
                  className="form-select"
                  value={user.role}
                  disabled={user.id === currentUser.id}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="currys">CSR / Booker</option>
                  <option value="currys_admin">Currys Admin</option>
                  <option value="adr_ops">ADR Ops</option>
                </select>
              </td>
              <td>{user.status || "active"}</td>
              <td>{user.last_login ? new Date(user.last_login).toLocaleString() : ""}</td>
              <td>
                {user.status !== "inactive" ? (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(user.id)}>
                    Deactivate
                  </button>
                ) : (
                  <button className="btn btn-sm btn-success" onClick={() => handleReactivate(user.id)}>
                    Reactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
