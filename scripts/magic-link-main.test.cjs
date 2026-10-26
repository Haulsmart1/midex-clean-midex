const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

test('provider verifies token and uses trusted stored role', () => {
  const code = read('pages/api/auth/[...nextauth].js');
  assert.match(code, /id: 'supabase-session'/);
  assert.match(code, /auth\.getUser\(accessToken\)/);
  assert.match(code, /from\('users'\)/);
  assert.match(code, /is_active === false/);
  assert.doesNotMatch(code, /NEXTAUTH_SECRET \|\| 'changeme'/);
});

test('empty legacy role fields fall back to the verified user role assignment', () => {
  const code = read('pages/api/auth/[...nextauth].js');
  const fallbackStart = code.indexOf(".from('user_roles')");
  const userFilter = code.indexOf(".eq('user_id', data.user.id)", fallbackStart);
  const missingRoleCheck = code.indexOf("approved_role_missing", fallbackStart);

  assert.notEqual(fallbackStart, -1);
  assert.notEqual(userFilter, -1);
  assert.ok(missingRoleCheck > userFilter);
  assert.match(code, /const role = profile\.role \|\| assignedRoles\[0\] \|\| null/);
  assert.match(code, /const roles = profileRoles\.length > 0 \? profileRoles : assignedRoles/);
  assert.doesNotMatch(code, /user_metadata|raw_user_meta_data/);
});

test('role assignment lookup fails closed', () => {
  const code = read('pages/api/auth/[...nextauth].js');
  assert.match(code, /if \(roleError\)[\s\S]*assigned_role_lookup_failed[\s\S]*return null/);
});

test('ambiguous stored role assignments are not silently elevated', () => {
  const code = read('pages/api/auth/[...nextauth].js');
  const guardLine = code
    .split('\n')
    .find((line) => line.includes('new Set(assignedRoles).size > 1'));

  assert.ok(guardLine, 'expected the ambiguous-role guard');
  assert.match(guardLine, /^\s*if \(/, 'guard must be executable code, not a comment');
  assert.doesNotMatch(code, /stored\\n/, 'escaped newlines must not comment out the guard');
  assert.match(code, /ambiguous_assigned_roles[\s\S]*return null/);
});

test('homepage recovers only a complete Supabase bearer fragment', () => {
  const code = read('pages/index.js');

  assert.match(code, /new URLSearchParams\(fragment\)/);
  assert.match(code, /tokens\.get\('access_token'\)/);
  assert.match(code, /tokens\.get\('refresh_token'\)/);
  assert.match(code, /tokens\.get\('token_type'\) === 'bearer'/);
  assert.match(code, /window\.location\.replace\('\/auth\/magic-link#' \+ fragment\)/);
  assert.doesNotMatch(code, /console\.(?:log|info|warn|error)\([^)]*fragment/);
});

test('magic-link callback consumes the fragment before the NextAuth handoff', () => {
  const callback = read('pages/auth/magic-link.js');
  const client = read('lib/supabaseClient.js');

  assert.match(client, /detectSessionInUrl: true/);
  assert.match(callback, /supabase\.auth\.getSession\(\)/);
  assert.match(callback, /signIn\('supabase-session'/);
  assert.match(callback, /router\.replace\('\/auth\/redirect'\)/);
});
