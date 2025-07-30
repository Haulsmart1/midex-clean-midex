export const generatePassword = () => {
  // Generate a random 10-character password
  return Math.random().toString(36).slice(-10)
}
