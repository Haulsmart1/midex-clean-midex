// NextAuth verifies the enclosing cookie. Decoding here only checks expiry.
function sessionIsCurrent(session, now = Date.now()) {
  const user = session?.user;
  if (!user?.id || typeof user.supabaseAccessToken !== 'string') return false;
  try {
    const { exp } = JSON.parse(Buffer.from(user.supabaseAccessToken.split('.')[1], 'base64url').toString());
    return Number.isFinite(exp) && exp * 1000 > now + 30000;
  } catch { return false; }
}
module.exports = { sessionIsCurrent };
