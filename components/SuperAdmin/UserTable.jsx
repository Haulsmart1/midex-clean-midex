import { supabase } from '/lib/supabaseClient'
import { toast } from 'react-toastify'
import { generatePassword } from '/utils/generatePassword'
import bcrypt from 'bcryptjs'
import PasswordModal from '/components/Shared/PasswordModal'
import { useState } from 'react'
import styles from '@/styles/SuperAdminForms.module.css';

export default function UserTable({ users, refresh }) {
  const [passwordModal, setPasswordModal] = useState({ open: false, password: '' })

  const handleToggleBan = async (u) => {
    await supabase.from('users').update({ banned: !u.banned }).eq('id', u.id)
    refresh()
  }

  const handlePromoteDemote = async (u) => {
    await supabase.from('users').update({ super_admin: !u.super_admin }).eq('id', u.id)
    refresh()
  }

  const handleResetPassword = async (u) => {
    const rawPass = generatePassword()
    const hashed = await bcrypt.hash(rawPass, 10)
    await supabase.from('users').update({ password: hashed }).eq('id', u.id)
    setPasswordModal({ open: true, password: rawPass })
  }

  return (
    <>
      <table className="table table-dark table-bordered mt-4">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Banned</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.banned ? '❌' : '✅'}</td>
              <td>
                <button onClick={() => handleToggleBan(u)} className="btn btn-sm btn-outline-danger me-2">{u.banned ? 'Unban' : 'Ban'}</button>
                {u.role === 'admin' && <button onClick={() => handlePromoteDemote(u)} className="btn btn-sm btn-outline-warning me-2">{u.super_admin ? 'Demote' : 'Promote'}</button>}
                <button onClick={() => handleResetPassword(u)} className="btn btn-sm btn-outline-light">Reset Pass</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {passwordModal.open && <PasswordModal password={passwordModal.password} onClose={() => setPasswordModal({ open: false, password: '' })} />}
    </>
  )
}
