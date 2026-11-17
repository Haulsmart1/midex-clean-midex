const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const adapterRequire = createRequire(require.resolve('../lib/server/enquiryRepository.cjs'));

// Load the real transaction adapter without connecting to any database.
const adapter = { exports: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../lib/server/enquiryRepository.cjs'), 'utf8'), {
  module: adapter, process: { env: {} },
  require(name) { return name === 'pg' ? { Pool: class {} } : adapterRequire(name); },
});

function fixture() {
  const rows = new Map();
  const calls = [];
  let attempts = 0;
  const client = {
    release() {},
    async query(sql, values = []) {
      calls.push(sql);
      if (sql.startsWith('SELECT reference, fingerprint')) {
        const row = rows.get(values[0]);
        return { rowCount: row ? 1 : 0, rows: row ? [row] : [] };
      }
      if (sql.includes('INSERT INTO midnight_enquiries.rate_limits')) {
        return { rows: [{ attempts: ++attempts }] };
      }
      if (sql.startsWith('INSERT INTO midnight_enquiries.enquiries')) {
        rows.set(values[1], { reference: values[0], fingerprint: values[2], notification: values[4] });
      }
      return { rows: [], rowCount: 0 };
    },
  };
  return { repo: adapter.exports.repository({ connect: async () => client }), calls, attempts: () => attempts };
}
const input = (requestKey = 'request-one') => ({
  requestKey, fingerprint: 'unchanged', data: { name: 'Synthetic retry' }, files: [],
  rates: [{ key: 'synthetic-email', limit: 5 }], notification: 'disabled',
});

test('lost-response retries recover the original receipt beyond the submission limit', async () => {
  const f = fixture();
  const original = await f.repo.capture(input());
  for (let attempt = 0; attempt < 10; attempt++) {
    const retry = await f.repo.capture(input());
    assert.equal(retry.reference, original.reference);
    assert.equal(retry.notification, 'disabled');
    assert.equal(retry.limited, undefined);
  }
  assert.equal(f.attempts(), 1);
  assert.equal(f.calls.filter(sql => sql.startsWith('INSERT INTO midnight_enquiries.enquiries')).length, 1);
  assert(f.calls.indexOf('SELECT pg_advisory_xact_lock(hashtextextended($1,0))') < f.calls.findIndex(sql => sql.startsWith('SELECT reference, fingerprint')));
});

test('new submissions still consume the limit while an existing receipt remains recoverable', async () => {
  const f = fixture();
  const original = await f.repo.capture(input());
  for (let i = 2; i <= 5; i++) assert((await f.repo.capture(input('request-' + i))).reference);
  assert.equal((await f.repo.capture(input('request-six'))).limited, true);
  assert.equal((await f.repo.capture(input())).reference, original.reference);
  assert.equal(f.attempts(), 6);
});

test('changed payload under an existing key stays a conflict without replacing the enquiry', async () => {
  const f = fixture();
  const original = await f.repo.capture(input());
  assert.equal((await f.repo.capture({ ...input(), fingerprint: 'changed' })).conflict, true);
  assert.equal((await f.repo.capture(input())).reference, original.reference);
  assert.equal(f.attempts(), 1);
});
