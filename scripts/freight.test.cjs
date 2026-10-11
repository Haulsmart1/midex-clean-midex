const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createShipment, applyAction, compareQuotes, fromBooking } = require('../lib/freight/desk.cjs');
const { createMockHaulsmartAdapter } = require('../lib/freight/mockHaulsmart.cjs');
const { sessionIsCurrent } = require('../lib/server/sessionPolicy.cjs');
const now = '2026-10-11T10:00:00.000Z';
const input = { reference: 'MID-001', origin: 'Manchester', destination: 'London', weightKg: 500, currency: 'GBP' };
const step = (shipment, action) => applyAction(shipment, action, shipment.version, now);
const planned = () => step(createShipment(input, 's1', now), { type: 'plan', vehicle: 'Rigid', collectionDate: '2026-10-12' });
const quoted = () => { const s = planned(); return step(s, { type: 'tender', quotes: createMockHaulsmartAdapter().tender(s, now) }); };
test('create once, plan, tender, compare, book, track, POD, close with audit history', () => {
  let shipment = quoted();
  assert.equal(compareQuotes(shipment, now)[0].amountMinor, 39500);
  for (const action of [{ type: 'book', quoteId: 's1:mock:2' }, { type: 'depart' }, { type: 'deliver' }, { type: 'receive_pod', documentRef: 'MOCK-POD-001' }, { type: 'close' }]) shipment = step(shipment, action);
  assert.equal(shipment.stage, 'closed');
  assert.equal(shipment.events.length, 8);
  assert.equal(shipment.award.amountMinor, 39500);
  assert.equal(shipment.pod.reference, 'MOCK-POD-001');
});
test('reject skipped stages, replayed awards and stale versions', () => {
  assert.throws(() => step(planned(), { type: 'close' }));
  const s = quoted();
  const booked = step(s, { type: 'book', quoteId: 's1:mock:1' });
  assert.throws(() => step(booked, { type: 'book', quoteId: 's1:mock:2' }));
  assert.throws(() => applyAction(s, { type: 'book', quoteId: 's1:mock:1' }, 0, now));
  assert.equal(s.stage, 'quoted');
});
test('reject missing cargo and invalid currencies', () => {
  for (const change of [{ weightKg: -1 }, { weightKg: NaN }, { currency: 'XYZ' }, { origin: '' }]) assert.throws(() => createShipment({ ...input, ...change }, 's1', now));
});
test('invalid timestamps and out-of-order tracking events cannot enter history', () => {
  assert.throws(() => createShipment(input, 's1', 'bad-time'));
  assert.throws(() => applyAction(planned(), { type: 'tender', quotes: [] }, 1, '2026-10-10T10:00:00Z'));
});
test('reject expired, foreign shipment, mixed currency, duplicate and live quotes', () => {
  const s = planned();
  const quotes = createMockHaulsmartAdapter().tender(s, now);
  for (const change of [{ currency: 'EUR' }, { amountMinor: 1.5 }, { shipmentId: 's2' }, { mode: 'live' }, { expiresAt: now }]) assert.throws(() => step(s, { type: 'tender', quotes: [{ ...quotes[0], ...change }] }));
  assert.throws(() => step(s, { type: 'tender', quotes: [quotes[0], quotes[0]] }));
  assert.throws(() => applyAction(quoted(), { type: 'book', quoteId: quotes[0].id }, 2, '2026-10-13T10:00:00Z'));
});
test('POD gates close and a nonempty document reference is required', () => {
  let s = step(quoted(), { type: 'book', quoteId: 's1:mock:1' });
  s = step(step(s, { type: 'depart' }), { type: 'deliver' });
  assert.throws(() => step(s, { type: 'close' }));
  assert.throws(() => step(s, { type: 'receive_pod', documentRef: ' ' }));
});
test('adapter deterministic and rejects actual bookings', () => {
  const adapter = createMockHaulsmartAdapter();
  assert.deepEqual(adapter.tender(planned(), now), adapter.tender(planned(), now));
  assert.throws(() => adapter.tender({ ...planned(), mode: 'live' }, now));
  assert.throws(() => step({ ...planned(), mode: 'live' }, { type: 'depart' }));
});
test('legacy booking projection does not invent award or procurement stage', () => {
  const result = fromBooking({ id: 'b1', status: 'completed', collections: [{ postcode: 'M1' }], deliveries: [{ postcode: 'SW1' }] });
  assert.equal(result.status, 'completed');
  assert.equal(result.stage, undefined);
  assert.equal(result.mode, 'existing_booking_read_only');
});
test('session policy rejects missing, malformed and expired database tokens', () => {
  const token = (exp) => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
  const session = (access) => ({ user: { id: 'u1', supabaseAccessToken: access } });
  const clock = Date.parse(now);
  assert.equal(sessionIsCurrent(session(token(clock / 1000 + 3600)), clock), true);
  for (const access of ['bad', token(clock / 1000), token('tomorrow'), token(clock / 1000 + 10)]) assert.equal(sessionIsCurrent(session(access), clock), false);
  assert.equal(sessionIsCurrent(null, clock), false);
});
