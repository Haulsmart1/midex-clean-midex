import { getServerSession } from 'next-auth';
import { authOptions } from './authConfig';
import { sessionIsCurrent } from './sessionPolicy.cjs';

export async function releaseRouteAccess(context, allowedRoles, enforcePartner = false) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!sessionIsCurrent(session)) return { redirect: { destination: '/login', permanent: false } };
  const user = session.user;
  const roles = [...(Array.isArray(user.roles) ? user.roles : []), user.role].filter(Boolean).map(role => String(role).toLowerCase());
  if (!roles.some(role => allowedRoles.includes(role))) return { redirect: { destination: '/unauthorized', permanent: false } };
  let partners = user.partner_type || [];
  if (typeof partners === 'string') {
    try { partners = JSON.parse(partners); } catch { partners = [partners]; }
  }
  if (!Array.isArray(partners)) partners = [partners];
  partners = partners.map(partner => String(partner).toLowerCase().trim());
  if (enforcePartner && !partners.includes(String(context.params?.partner || '').toLowerCase()) && !roles.includes('super_admin') && !roles.includes('admin')) return { redirect: { destination: '/unauthorized', permanent: false } };
  context.res.setHeader('Cache-Control', 'private, no-store');
  return { props: { session: JSON.parse(JSON.stringify(session)) } };
}
