import bcrypt from 'bcryptjs'

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}
