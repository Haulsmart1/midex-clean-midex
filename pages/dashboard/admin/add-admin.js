import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/layouts/AdminLayout';
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AddAdminPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const generatePassword = () => {
    return (
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-5)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const rawPassword = generatePassword()

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(rawPassword, salt)

    const { data, error } = await supabase.from('users').insert({
      ...form,
      password: hashedPassword,
      role: 'admin',
      approved: true,
      banned: false,
      account_number: `MIDEX-ADM-${Math.floor(
        100000 + Math.random() * 900000
      )}`
    })

    if (error) {
      setMessage('❌ Failed to add admin: ' + error.message)
    } else {
      await fetch('/api/send-new-admin-email', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: rawPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      setMessage('✅ Admin Created & Email Sent')
      setForm({ name: '', email: '' })
    }
  }

  return (
    <AdminLayout>
      <div className="container py-4 text-white">
        <h1 className="display-6 mb-4 fw-bold">Add New Admin</h1>

        {message && <div className="alert alert-info">{message}</div>}

        <form
          onSubmit={handleSubmit}
          className="p-4 bg-dark border rounded"
        >
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={form.name}
            required
            className="form-control mb-2"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            onChange={handleChange}
            value={form.email}
            required
            className="form-control mb-2"
          />
          <button
            type="submit"
            className="btn btn-outline-success w-100 fw-bold"
          >
            Create Admin
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
