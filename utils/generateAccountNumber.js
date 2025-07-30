export const generateAccountNumber = (role) => {
  if (role === 'admin') {
    return null // No Account Number for Admins
  }

  const prefix = {
    user: 'MIDEX-USER',
    forwarder: 'MIDEX-FWD'
  }[role] || 'MIDEX-USER'

  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`
}
