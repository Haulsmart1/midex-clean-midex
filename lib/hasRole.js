export function hasRole(session, allowedRoles = []) {
  if (!session?.user) return false;

  // Normalize everything to lowercase
  const role = (session.user.role || '').toLowerCase();
  const rolesArray = (session.user.roles || []).map(r => r.toLowerCase());

  // Normalize allowed roles too
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

  return (
    normalizedAllowed.includes(role) ||
    rolesArray.some(r => normalizedAllowed.includes(r))
  );
}

