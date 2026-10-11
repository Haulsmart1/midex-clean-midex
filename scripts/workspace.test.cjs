const { test } = require('node:test');
const assert = require('node:assert/strict');
const local = require('../lib/freight/workspace.cjs');
const now = '2026-10-11T12:00:00Z';
const input = { reference: 'RESTORE-001', origin: 'Manchester', destination: 'London', weightKg: 500, currency: 'GBP' };
function fixture() {
  let workspace = local.createWorkspace(input, 's1', now);
  for (const action of [{ type: 'plan', vehicle: 'Rigid', collectionDate: '2026-10-12' }, { type: 'tender' }, { type: 'book', quoteId: 's1:mock:2' }, { type: 'depart' }]) workspace = local.dispatch(workspace, action, now);
  return workspace;
}
test('saved demo replays exactly after interruption without duplicating its shipment or award', () => {
  const before = fixture();
  const restored = local.restore(local.serialize(before));
  assert.deepEqual(restored, before);
  let completed = restored;
  for (const action of [{ type: 'deliver' }, { type: 'receive_pod', documentRef: 'DEMO-POD' }, { type: 'close' }]) completed = local.dispatch(completed, action, now);
  assert.equal(completed.shipment.stage, 'closed');
  assert.equal(completed.shipment.id, before.shipment.id);
  assert.equal(completed.shipment.events.filter((event) => event.type === 'book').length, 1);
});
test('restore rejects corrupted, future-schema, oversized and live snapshots', () => {
  const snapshot = JSON.parse(local.serialize(fixture()));
  for (const raw of ['bad JSON', 'x'.repeat(65537), JSON.stringify({ ...snapshot, schemaVersion: 2 }), JSON.stringify({ ...snapshot, mode: 'live' }), JSON.stringify({ ...snapshot, commands: [null] })]) assert.throws(() => local.restore(raw));
});
test('restore rebuilds state rather than trusting injected stage, award or quotes', () => {
  const snapshot = JSON.parse(local.serialize(fixture()));
  snapshot.shipment = { stage: 'closed', award: { amountMinor: 0 } };
  snapshot.commands[1].action.quotes = [{ amountMinor: 0, mode: 'live' }];
  const restored = local.restore(JSON.stringify(snapshot));
  assert.equal(restored.shipment.stage, 'in_transit');
  assert.equal(restored.shipment.award.amountMinor, 39500);
});
test('restore cannot skip POD or manufacture a second award', () => {
  const snapshot = JSON.parse(local.serialize(fixture()));
  for (const action of [{ type: 'close' }, { type: 'book', quoteId: 's1:mock:1' }]) assert.throws(() => local.restore(JSON.stringify({ ...snapshot, commands: [...snapshot.commands, { action, at: now }] })));
});
test('historical quote replay works even after its expiry; a new award still cannot use it', () => {
  let w = local.createWorkspace(input, 's1', now);
  w = local.dispatch(w, { type: 'plan', vehicle: 'Rigid', collectionDate: '2026-10-12' }, now);
  w = local.dispatch(w, { type: 'tender' }, now);
  const restored = local.restore(local.serialize(w));
  assert.throws(() => local.dispatch(restored, { type: 'book', quoteId: 's1:mock:1' }, '2026-10-15T12:00:00Z'));
  assert.deepEqual(local.restore(local.serialize(fixture())), fixture());
});
test('expired quotes can be refreshed and awarded without recreating the shipment', () => {
  let w = local.createWorkspace(input, 's1', now);
  w = local.dispatch(w, { type: 'plan', vehicle: 'Rigid', collectionDate: '2026-10-12' }, now);
  w = local.dispatch(w, { type: 'tender' }, now);
  const later = '2026-10-15T12:00:00Z';
  w = local.dispatch(local.restore(local.serialize(w)), { type: 'retender' }, later);
  w = local.dispatch(w, { type: 'book', quoteId: 's1:mock:1' }, later);
  assert.equal(w.shipment.id, 's1');
  assert.equal(w.shipment.stage, 'booked');
  assert.equal(w.shipment.events.filter((event) => event.type === 'created').length, 1);
  assert.deepEqual(local.restore(local.serialize(w)), w);
  assert.throws(() => local.dispatch(w, { type: 'retender' }, later));
});
test('another tab cannot overwrite a newer demo snapshot with stale state', () => {
  let raw = null;
  const storage = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
  const initial = fixture();
  const first = local.writeSnapshot(storage, null, initial);
  const newer = local.dispatch(initial, { type: 'deliver' }, now);
  const second = local.writeSnapshot(storage, first, newer);
  assert.throws(() => local.writeSnapshot(storage, first, initial), { code: 'STALE_DEMO' });
  assert.equal(raw, second);
  assert.equal(local.restore(raw).shipment.stage, 'delivered');
});
test('failed or unavailable storage leaves the caller model and saved state intact', () => {
  const w = fixture();
  const before = local.serialize(w);
  const storage = { getItem: () => before, setItem() { throw new Error('Storage quota exceeded'); } };
  assert.throws(() => local.writeSnapshot(storage, before, local.dispatch(w, { type: 'deliver' }, now)));
  assert.equal(local.serialize(w), before);
  assert.equal(storage.getItem(), before);
});
test('unrecognized saved content is not overwritten by creating a new demo', () => {
  let writes = 0;
  const storage = { getItem: () => 'corrupted snapshot', setItem: () => { writes += 1; } };
  assert.throws(() => local.writeSnapshot(storage, null, fixture()), { code: 'STALE_DEMO' });
  assert.equal(writes, 0);
});
