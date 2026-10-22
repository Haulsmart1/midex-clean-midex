const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

test('magic-link login cannot create accounts', () => {
  const login = read('pages/login.js');
  assert.match(login, /signInWithOtp/);
  assert.match(login, /shouldCreateUser:\s*false/);
  assert.match(login, /auth\/magic-link/);
});
test('provider verifies token and uses trusted stored role', () => {
  const code = read('pages/api/auth/[...nextauth].js');
  assert.match(code, /id: 'supabase-session'/);
  assert.match(code, /auth\.getUser\(accessToken\)/);
  assert.match(code, /from\('users'\)/);
  assert.match(code, /is_active === false/);
  assert.doesNotMatch(code, /NEXTAUTH_SECRET \|\| 'changeme'/);
});
test('callback and redirect require authenticated server session', () => {
  const callback = read('pages/auth/magic-link.js');
  const redirect = read('pages/auth/redirect.js');
  assert.match(callback, /signIn\('supabase-session'/);
  assert.match(callback, /session\.access_token/);
  assert.match(redirect, /status !== 'authenticated'/);
  assert.doesNotMatch(callback, /\.insert\(|\.upsert\(/);
});
