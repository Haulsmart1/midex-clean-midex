const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'docs', 'sql', 'midnight-user-roles-rls-review-candidate.sql'),
  'utf8',
);

const migrationDirectory = path.join(__dirname, '..', 'supabase', 'migrations');
const migrationNames = fs
  .readdirSync(migrationDirectory)
  .filter((name) => name.endsWith('_restrict_midnight_user_role_reads.sql'));
assert.equal(migrationNames.length, 1, 'expected one CLI-generated role policy migration');
const migration = fs.readFileSync(path.join(migrationDirectory, migrationNames[0]), 'utf8');

test('candidate is unmistakably review-only', () => {
  assert.match(sql, /REVIEW ONLY\. NOT A MIGRATION\. DO NOT APPLY/);
  assert.match(sql, /Generate a real migration/);
});

test('broad legacy policies are removed', () => {
  assert.match(sql, /drop policy if exists "user_roles_read_all"/);
  assert.match(sql, /drop policy if exists "allow super_admin manage roles"/);
  assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)/i);
});

test('authenticated users can read only their own role rows', () => {
  assert.match(sql, /for select\s+to authenticated/i);
  assert.match(sql, /\(select auth\.uid\(\)\) is not null/i);
  assert.match(sql, /user_id\s*=\s*\(select auth\.uid\(\)\)/i);
});

test('browser roles cannot mutate role assignments', () => {
  assert.match(sql, /revoke all privileges[\s\S]*from anon/i);
  assert.match(
    sql,
    /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/i,
  );
  assert.match(sql, /grant select[\s\S]*to authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(insert|update|delete|all)[\s\S]*to authenticated/i);
});

test('policy avoids deprecated or user-controlled authorization inputs', () => {
  assert.doesNotMatch(sql, /auth\.role\s*\(/i);
  assert.doesNotMatch(sql, /user_metadata|raw_user_meta_data/i);
  assert.doesNotMatch(sql, /@[a-z0-9.-]+/i);
});

test('live-service and cross-user acceptance checks remain mandatory', () => {
  assert.match(sql, /isolated database branch/i);
  assert.match(sql, /cross-user reads/i);
  assert.match(sql, /authenticated INSERT\/UPDATE\/DELETE attempts fail/i);
  assert.match(sql, /service_role maintenance remains possible/i);
});

test('CLI-generated migration carries the reviewed policy boundary', () => {
  assert.match(migrationNames[0], /^\d{14}_restrict_midnight_user_role_reads\.sql$/);
  assert.match(migration, /REVIEW-ONLY RELEASE CANDIDATE/);
  assert.match(migration, /drop policy if exists "user_roles_read_all"/);
  assert.match(migration, /drop policy if exists "allow super_admin manage roles"/);
  assert.match(migration, /for select\s+to authenticated/i);
  assert.match(migration, /user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(migration, /revoke all privileges[\s\S]*from anon/i);
  assert.match(migration, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/i);
  assert.doesNotMatch(migration, /using\s*\(\s*true\s*\)|auth\.role\s*\(|user_metadata|@[a-z0-9.-]+/i);
});
