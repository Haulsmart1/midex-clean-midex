const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { sessionIsCurrent } = require('../lib/server/sessionPolicy.cjs');
const expiry = Math.floor(Date.now() / 1000) + 3600;
const access = `header.${Buffer.from(JSON.stringify({ exp: expiry })).toString('base64url')}.signature`;
const validSession = { user: { id: 'owner', supabaseAccessToken: access } };
async function load(relative, mocks = {}, env = {}) {
  const context = vm.createContext({ console: { log() {}, error() {} }, process: { env }, Buffer, Date });
  const module = new vm.SourceTextModule(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'), { context });
  await module.link((name) => {
    const exports = mocks[name];
    if (!exports) throw new Error(`Unexpected import: ${name}`);
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context });
  });
  await module.evaluate();
  return module.namespace;
}
function response() {
  return { code: null, body: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
async function bookingHandler(session, client) {
  return (await load('pages/api/bookings/index.js', {
    '@/lib/server/supabaseForSession': { supabaseForSession: () => client },
    'next-auth': { getServerSession: async () => session },
    '@/lib/authOptions': { authOptions: {} },
    '@/lib/server/sessionPolicy.cjs': { sessionIsCurrent },
  })).default;
}
test('booking methods and unauthenticated access fail before database access', async () => {
  const handler = await bookingHandler(null, null);
  for (const [method, code] of [['DELETE', 405], ['GET', 401], ['POST', 401]]) {
    const res = response(); await handler({ method, query: {} }, res); assert.equal(res.code, code);
  }
});
test('booking GET refuses another owner and scopes database query', async () => {
  const filters = [];
  const query = { select() { return this; }, eq(k, v) { filters.push([k, v]); return this; }, async order() { return { data: [{ id: 'b1' }], error: null }; } };
  const handler = await bookingHandler(validSession, { from: () => query });
  let res = response(); await handler({ method: 'GET', query: { user_id: 'other' } }, res); assert.equal(res.code, 403); assert.equal(filters.length, 0);
  res = response(); await handler({ method: 'GET', query: {} }, res); assert.equal(res.code, 200); assert.deepEqual(filters, [['user_id', 'owner']]);
});
test('invalid pallets and costs produce 400 rather than a crash or insert', async () => {
  const handler = await bookingHandler(validSession, { from() { throw new Error('Must not insert'); } });
  for (const pallets of [undefined, 'invalid', [null], [[]]]) {
    const res = response(); await handler({ method: 'POST', body: { pallets, collectionPoints: [{}], deliveryPoints: [{}], collection_cost: 0, delivery_cost: 0, total_cost: -1 }, query: {} }, res); assert.equal(res.code, 400);
  }
});
test('booking owner cannot be supplied by caller; insert failures are handled', async () => {
  let inserted;
  const query = { insert(rows) { inserted = rows[0]; return this; }, select() { return this; }, async single() { return { data: { id: 'b1' }, error: null }; } };
  const body = { user_id: 'attacker', pallets: [{}], collectionPoints: [{}], deliveryPoints: [{}], collection_cost: 0, delivery_cost: 0, total_cost: 0 };
  let handler = await bookingHandler(validSession, { from: () => query });
  let res = response(); await handler({ method: 'POST', body, query: {} }, res); assert.equal(res.code, 200); assert.equal(inserted.user_id, 'owner');
  handler = await bookingHandler(validSession, { from() { throw new Error('private backend detail'); } });
  res = response(); await handler({ method: 'POST', body, query: {} }, res); assert.equal(res.code, 500); assert.equal(JSON.stringify(res.body).includes('private backend detail'), false);
});
test('retired endpoints report disabled or unimplemented without importing services', async () => {
  for (const [file, code] of [['haulsync', 410], ['test-supabase-login', 410], ['submit-booking', 501], ['downloads/[filename]', 410], ['add-user', 410], ['employees/reset-password', 410], ['reset-user-password', 410]]) {
    const handler = (await load(`pages/api/${file}.js`)).default;
    const res = response(); await handler({ method: 'POST' }, res); assert.equal(res.code, code);
  }
});
test('global account guard ignores caller roles and rejects expired or ordinary sessions', async () => {
  let session;
  let unavailable = false;
  const guard = (await load('lib/server/requireSuperAdmin.js', {
    'next-auth': { getServerSession: async () => { if (unavailable) throw new Error('backend private detail'); return session; } },
    '@/lib/authOptions': { authOptions: {} },
    './sessionPolicy.cjs': { sessionIsCurrent },
  })).requireSuperAdmin;
  for (const [value, code] of [[null, 401], [validSession, 403], [{ user: { ...validSession.user, role: 'super_admin', supabaseAccessToken: 'expired' } }, 401]]) {
    session = value; const res = response(); assert.equal(await guard({ body: { role: 'super_admin' } }, res), null); assert.equal(res.code, code);
  }
  for (const roleData of [{ role: 'super_admin' }, { roles: ['super_admin'] }]) {
    session = { user: { ...validSession.user, ...roleData } }; const res = response(); assert.equal(await guard({}, res), session); assert.equal(res.code, null);
  }
  unavailable = true; const res = response(); assert.equal(await guard({}, res), null); assert.equal(res.code, 503);
});
test('profile lookup exposes only the signed-in account and never constructs a service client', async () => {
  let session = null;
  const handler = (await load('pages/api/get-user-profile.js', {
    'next-auth': { getServerSession: async () => session },
    '@/lib/authOptions': { authOptions: {} },
    '@/lib/server/sessionPolicy.cjs': { sessionIsCurrent },
  })).default;
  let res = response(); await handler({ method: 'POST', body: { email: 'other@example.invalid' } }, res); assert.equal(res.code, 401);
  session = { user: { ...validSession.user, email: 'owner@example.invalid', role: 'user' } };
  res = response(); await handler({ method: 'POST', body: { email: 'other@example.invalid' } }, res); assert.equal(res.code, 403);
  res = response(); await handler({ method: 'POST', body: { email: 'OWNER@example.invalid' } }, res); assert.equal(res.code, 200); assert.equal(res.body.role, 'user'); assert.equal(res.body.supabaseAccessToken, undefined);
});
test('user listing authorizes before constructing a privileged client', async () => {
  let allowed = false;
  let clients = 0;
  const handler = (await load('pages/api/users.js', {
    '@/lib/server/requireSuperAdmin': { requireSuperAdmin: async (_req, res) => { if (allowed) return validSession; res.status(403).json({ error: 'Forbidden' }); return null; } },
    '@supabase/supabase-js': { createClient: () => { clients += 1; return { from: () => ({ select: async () => ({ data: [{ id: 'u1' }], error: null }) }) }; } },
  })).default;
  let res = response(); await handler({ method: 'POST' }, res); assert.equal(res.code, 405); assert.equal(clients, 0);
  res = response(); await handler({ method: 'GET' }, res); assert.equal(res.code, 403); assert.equal(clients, 0);
  allowed = true; res = response(); await handler({ method: 'GET' }, res); assert.equal(res.code, 200); assert.equal(clients, 1);
});
test('delete-user rejects unauthorized, malformed and self requests; reports partial failures', async () => {
  const target = '12345678-1234-1234-1234-123456789abc';
  let authorized = false;
  let self = false;
  let cleanupError = null;
  let clients = 0;
  let authDeletes = 0;
  const handler = (await load('pages/api/delete-user.js', {
    '@/lib/server/requireSuperAdmin': { requireSuperAdmin: async (_req, res) => { if (authorized) return { user: { id: self ? target : 'owner' } }; res.status(403).json({ error: 'Forbidden' }); return null; } },
    '@supabase/supabase-js': { createClient: () => { clients += 1; return { auth: { admin: { deleteUser: async () => { authDeletes += 1; return { error: null }; } } }, from: () => ({ delete: () => ({ eq: async () => ({ error: cleanupError }) }) }) }; } },
  })).default;
  let res = response(); await handler({ method: 'POST', body: { id: target } }, res); assert.equal(res.code, 403); assert.equal(clients, 0);
  authorized = true;
  for (const id of [undefined, [], 'invalid']) { res = response(); await handler({ method: 'POST', body: { id } }, res); assert.equal(res.code, 400); }
  self = true; res = response(); await handler({ method: 'POST', body: { id: target } }, res); assert.equal(res.code, 409); assert.equal(clients, 0);
  self = false; res = response(); await handler({ method: 'POST', body: { id: target } }, res); assert.equal(res.code, 200); assert.equal(authDeletes, 1);
  cleanupError = { message: 'private backend detail' }; res = response(); await handler({ method: 'POST', body: { id: target } }, res); assert.equal(res.code, 500); assert.equal(res.body.partial, true); assert.equal(JSON.stringify(res.body).includes('private backend detail'), false);
});
test('quote writes require owner verification before route calculation', async () => {
  let routeCalls = 0;
  let priceInput;
  let activeSession = null;
  let owned = false;
  let updateError = null;
  const filters = [];
  const client = { from() {
    let updating = false;
    return { select() { return this; }, eq(key, value) { filters.push([key, value]); return this; }, update() { updating = true; return this; }, async maybeSingle() { return { data: owned ? { id: 'b1' } : null, error: updating ? updateError : null }; } };
  } };
  const handler = (await load('pages/api/quote.js', {
    '@/utils/pricingEngine': { default: (input) => { priceInput = input; return { totalIncVat: 123 }; } },
    '@/utils/resolveRoute': { resolveRoute: async () => { routeCalls += 1; return { totalMiles: 100, legs: [{}], collectionMiles: 100, deliveryMiles: 0, middleMiles: 0, ferryMiles: 0, ferryRoute: null }; } },
    'next-auth': { getServerSession: async () => activeSession },
    '@/lib/authOptions': { authOptions: {} },
    '@/lib/server/supabaseForSession': { supabaseForSession: () => client },
    '@/lib/server/sessionPolicy.cjs': { sessionIsCurrent },
  })).default;
  const req = { method: 'POST', body: { bookingId: 'b1', from: 'M1', to: 'SW1', pallets: [{}] } };
  let res = response(); await handler(req, res); assert.equal(res.code, 401); assert.equal(routeCalls, 0);
  activeSession = validSession;
  res = response(); await handler(req, res); assert.equal(res.code, 404); assert.equal(routeCalls, 0);
  owned = true;
  res = response(); await handler(req, res); assert.equal(res.code, 200); assert.equal(priceInput.collectionMiles, 100); assert.equal(res.body.routeInfo.routeType, 'internal');
  assert.ok(filters.filter(([key, value]) => key === 'user_id' && value === 'owner').length >= 3);
  updateError = { message: 'private detail' };
  res = response(); await handler(req, res); assert.equal(res.code, 500); assert.equal(JSON.stringify(res.body).includes('private detail'), false);
});
test('auth config uses independent login clients and no plaintext password lookup', async () => {
  let clients = 0;
  const user = { id: 'owner', email: 'demo@example.invalid' };
  const config = (await load('lib/server/authConfig.js', {
    'next-auth/providers/credentials': { default: (options) => options },
    '@supabase/supabase-js': { createClient: () => {
      clients += 1;
      return { auth: { signInWithPassword: async () => ({ data: { user, session: { access_token: access, refresh_token: 'not-a-real-token' } } }) }, from: () => ({ select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: { name: 'Demo', role: 'user' } }; } }) };
    } },
    './sessionPolicy.cjs': { sessionIsCurrent },
  })).authOptions;
  assert.equal(clients, 0);
  const authorize = config.providers[0].authorize;
  assert.equal(await authorize(undefined), null);
  await Promise.all([authorize({ email: user.email, password: 'demo' }), authorize({ email: user.email, password: 'demo' })]);
  assert.equal(clients, 2);
  const expired = await config.callbacks.jwt({ token: { id: 'owner', supabaseAccessToken: 'bad', supabaseRefreshToken: 'private' } });
  assert.equal(expired.error, 'ReauthenticationRequired'); assert.equal(expired.supabaseAccessToken, undefined); assert.equal(expired.supabaseRefreshToken, undefined);
  assert.equal(config.secret, undefined);
});

test('admin notification SMTP credentials come from environment rather than embedded literals', async () => {
  let transportOptions;
  const handler = (await load('pages/api/send-new-admin-email.js', {
    'midnight-nodemailer': { default: { createTransport: (options) => {
      transportOptions = options;
      return { sendMail: async () => ({}) };
    } } },
  }, { EMAIL_USER: 'local@example.invalid', EMAIL_PASS: 'dummy-not-a-credential' })).default;
  const res = response();
  await handler({ body: JSON.stringify({ name: 'Demo', email: 'recipient@example.invalid', password: 'dummy' }) }, res);
  assert.equal(res.code, 200);
  assert.equal(transportOptions.auth.user, 'local@example.invalid');
  assert.equal(transportOptions.auth.pass, 'dummy-not-a-credential');
});
