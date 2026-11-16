// Staff authority is pinned server-side; editable profile roles never grant access.
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
async function authorize(req, env, fetcher = fetch) {
  const prefix = 'MIDNIGHT';
  const subjects = (env[prefix+'_ENQUIRY_STAFF_SUBJECTS'] || '').split(',').map(x=>x.trim()).filter(x=>uuid.test(x));
  const project = env[prefix+'_ENQUIRY_AUTH_PROJECT_REF'];
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!project || !/^[a-z]{20}$/.test(project) || url !== 'https://'+project+'.supabase.co' || !key || !subjects.length) return {code:503};
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !/^Bearer [A-Za-z0-9._~-]+$/.test(header)) return {code:401};
  try {
    const response = await fetcher(url+'/auth/v1/user', {
      headers:{apikey:key,Authorization:header},signal:AbortSignal.timeout(5000),redirect:'error',cache:'no-store',
    });
    if (!response.ok) return {code:response.status===401 || response.status===403 ? 401 : 503};
    const user = await response.json();
    if (!uuid.test(user?.id || '') || !user.email_confirmed_at || user.is_anonymous || (user.banned_until && Date.parse(user.banned_until)>Date.now())) return {code:403};
    if (!subjects.includes(user.id)) return {code:403};
    return {code:200,id:user.id};
  } catch { return {code:503}; }
}
module.exports = {authorize};
