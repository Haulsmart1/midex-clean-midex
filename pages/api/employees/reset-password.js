import { hashPassword } from '/utils/hashPassword'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, newPassword } = req.body

  const hashedPassword = await hashPassword(newPassword)

  const { error } = await supabase
    .from('employees')
    .update({ password: hashedPassword })
    .eq('email', email)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: 'Password updated' })
}
