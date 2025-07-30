import Head from 'next/head'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'react-toastify'

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, approved, created_at')

    if (error) {
      toast.error('Failed to fetch registrations')
    } else {
      setRegistrations(data)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) toast.error('Failed to delete user')
    else {
      toast.success('User deleted')
      fetchRegistrations()
    }
  }

  const startEdit = (user) => {
    setEditingId(user.id)
    setEditForm({ name: user.name, email: user.email })
  }

  const saveEdit = async (id) => {
    const { error } = await supabase.from('users').update(editForm).eq('id', id)
    if (error) toast.error('Failed to update user')
    else {
      toast.success('User updated')
      setEditingId(null)
      fetchRegistrations()
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>Registrations | Admin | Midnight Express</title>
      </Head>

      <h1 className="display-6 fw-bold mb-4">New Registrations</h1>
      <p className="text-muted mb-5">Monitor account registrations and status.</p>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-bordered align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td>
                  {editingId === reg.id ? (
                    <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  ) : reg.name}
                </td>

                <td>
                  {editingId === reg.id ? (
                    <input className="form-control" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  ) : reg.email}
                </td>

                <td className="text-capitalize">{reg.role}</td>
                <td>
                  {reg.approved ? (
                    <span className="badge bg-success">Verified</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending</span>
                  )}
                </td>
                <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                <td>
                  {editingId === reg.id ? (
                    <>
                      <button onClick={() => saveEdit(reg.id)} className="btn btn-sm btn-success m-1">Save</button>
                      <button onClick={() => setEditingId(null)} className="btn btn-sm btn-secondary m-1">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(reg)} className="btn btn-sm btn-outline-primary m-1">Edit</button>
                      <button onClick={() => deleteUser(reg.id)} className="btn btn-sm btn-outline-danger m-1">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
