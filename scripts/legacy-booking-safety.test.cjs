// Isolated read-only tests: no SMTP, database, live website or real credentials.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function load(rel, injected = {}) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8')
    .replace(/^import\s+.*?;\s*$/gm, '')
    .replace(/export default async function handler/, 'async function handler');
  assert.match(source, /async function handler\(/, rel);
  const module = { exports: {} };
  vm.runInNewContext(source + '\nmodule.exports = handler;', {
    module, exports: module.exports, ...injected,
  }, { filename: rel, timeout: 1000 });
  return module.exports;
}
function response() {
  return {
    headers: {}, code: null, body: null,
    setHeader(k, v) { this.headers[k] = v; return this; },
    status(v) { this.code = v; return this; },
    json(v) { this.body = v; return this; },
  };
}

for (const endpoint of [
  'pages/api/sendBookingAlerts.js',
  'pages/api/notify-fast-booking.js',
  'pages/api/submit-booking.js',
  'pages/api/contact.js',
]) {
  test(endpoint + ' never sends mail or falsely confirms a booking', async () => {
    const handler = load(endpoint, { process: { env: {} } });
    const res = response();
    await handler({ method: 'POST', body: { totalQuote: 0, quote: { total: 0.01 } } }, res);
    assert.equal(res.code, 410);
    assert.match(res.body.error, /disabled|retired/i);
    assert.doesNotMatch(JSON.stringify(res.body), /success":true|booking saved|email sent successfully/i);
    assert.match(res.headers['Cache-Control'], /no-store/);
    const invalid = response();
    await handler({ method: 'GET' }, invalid);
    assert.equal(invalid.code, 405);
  });
}

test('legacy booking collection requires a session for reads and never writes client prices', async () => {
  let user = null, queries = 0, matchedOwner = '';
  const db = {
    from(table) {
      assert.equal(table, 'bookings'); queries++;
      return {
        select() { return this; },
        eq(column, value) {
          assert.equal(column, 'user_id'); matchedOwner = value; return this;
        },
        order() { return this; },
        async limit() { return { data: [{ id: 'synthetic-owned-booking' }], error: null }; },
      };
    },
  };
  const handler = load('pages/api/bookings/index.js', {
    getServerSession: async () => user ? { user: { id: user } } : null,
    authOptions: {}, supabase: db,
  });
  let res = response();
  await handler({ method: 'GET', query: { user_id: 'victim' } }, res);
  assert.equal(res.code, 401);
  assert.equal(queries, 0);
  user = 'synthetic-owner';
  res = response();
  await handler({ method: 'GET', query: { user_id: 'someone-else' } }, res);
  assert.equal(res.code, 403);
  assert.equal(queries, 0);
  res = response();
  await handler({ method: 'GET', query: { user_id: user } }, res);
  assert.equal(res.code, 200);
  assert.equal(matchedOwner, user);
  assert.equal(queries, 1);
  res = response();
  await handler({ method: 'POST', body: { total_cost: 0.01, customer: 'synthetic' } }, res);
  assert.equal(res.code, 410);
  assert.equal(queries, 1);
});

test('public quote preview cannot mutate a booking using a supplied ID', async () => {
  const handler = load('pages/api/quote.js', {
    calculateQuote: async () => ({ total: 99.95 }),
    resolveRoute: async () => ({ legs: [{ distanceMiles: 5 }], totalMiles: 30, ferryRoute: 'UK' }),
  });
  const res = response();
  await handler({
    method: 'POST',
    body: { bookingId: 'someone-elses-id', from: 'London', to: 'Manchester', pallets: [{ weight: 1 }] },
  }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.total, 99.95);
  assert.equal(res.body.routeInfo.totalMiles, 30);
});
