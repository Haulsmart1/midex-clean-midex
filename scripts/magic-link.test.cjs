const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function loadAuth(createClient) {
  const context = vm.createContext({
    console: { log() {}, error() {} },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'offline-only' } },
    Buffer,
    Date,
  });
  const module = new vm.SourceTextModule(fs.readFileSync(path.join(__dirname, '..', 'lib/server/authConfig.js'), 'utf8'), { context });
  await module.link((name) => {
    const mocks = {
      'next-auth/providers/credentials': { default: (options) => options },
      '@supabase/supabase-js': { createClient },
      './sessionPolicy.cjs': { sessionIsCurrent: () => true },
    }[name];
    if (!mocks) throw new Error(`Unexpected import: ${name}`);
    return new vm.SyntheticModule(Object.keys(mocks), function () {
      for (const [key, value] of Object.entries(mocks)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace.authOptions;
}

test('magic-link provider verifies the Supabase user and derives role from the trusted profile row', async () => {
  const calls = [];
  const auth = await loadAuth((_url, _key, options) => ({
    auth: {
      getUser: async (token) => {
        calls.push(['getUser', token, options.global.headers.Authorization]);
        return { data: { user: { id: 'midnight-admin', email: 'owner@example.invalid' } }, error: null };
      },
    },
    from(table) {
      return {
        select() { return this; },
        eq(column, value) { calls.push(['profile', table, column, value]); return this; },
        async maybeSingle() { return { data: table === 'users' ? { name: 'Owner', role: 'super_admin', roles: ['super_admin'] } : null, error: null }; },
      };
    },
  }));

  const provider = auth.providers.find((item) => item.id === 'supabase-session');
  const user = await provider.authorize({ accessToken: 'verified-access', refreshToken: 'verified-refresh' });
  assert.equal(user.id, 'midnight-admin');
  assert.equal(user.role, 'super_admin');
  assert.deepEqual(Array.from(user.roles), ['super_admin']);
  assert.deepEqual(calls[0], ['getUser', 'verified-access', 'Bearer verified-access']);
  assert.deepEqual(calls[1], ['profile', 'users', 'id', 'midnight-admin']);
});

test('magic-link provider fails closed for missing or rejected tokens', async () => {
  const auth = await loadAuth(() => ({
    auth: { getUser: async () => ({ data: { user: null }, error: new Error('invalid') }) },
    from() { throw new Error('Profile lookup must not run'); },
  }));
  const provider = auth.providers.find((item) => item.id === 'supabase-session');
  assert.equal(await provider.authorize(undefined), null);
  assert.equal(await provider.authorize({ accessToken: 'bad', refreshToken: 'refresh' }), null);
});

test('login requests a one-time link without creating accounts and callback mints NextAuth only after Supabase session exists', () => {
  const login = fs.readFileSync(path.join(__dirname, '..', 'pages/login.js'), 'utf8');
  const callback = fs.readFileSync(path.join(__dirname, '..', 'pages/auth/magic-link.js'), 'utf8');
  assert.match(login, /signInWithOtp/);
  assert.match(login, /shouldCreateUser:\s*false/);
  assert.match(login, /\/auth\/magic-link/);
  assert.match(callback, /signIn\('supabase-session'/);
  assert.match(callback, /session\.access_token/);
  assert.doesNotMatch(callback, /from\(|insert\(|update\(|upsert\(/);
});
