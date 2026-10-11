const desk = require('./desk.cjs');
const { createMockHaulsmartAdapter } = require('./mockHaulsmart.cjs');
const KEY = 'midnight:freight-demo:v1';
function createWorkspace(input, id, now) {
  const shipment = desk.createShipment(input, id, now);
  return {
    schemaVersion: 1, mode: 'local_mock',
    seed: { input: { reference: shipment.reference, origin: shipment.origin, destination: shipment.destination, weightKg: shipment.weightKg, currency: shipment.currency }, id, at: now },
    commands: [], shipment,
  };
}
function normalizeAction(action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) throw new Error('Invalid demo action');
  switch (action.type) {
    case 'plan': return { type: 'plan', vehicle: action.vehicle, collectionDate: action.collectionDate };
    case 'book': return { type: 'book', quoteId: action.quoteId };
    case 'receive_pod': return { type: 'receive_pod', documentRef: action.documentRef };
    case 'tender': case 'retender': case 'depart': case 'deliver': case 'close': return { type: action.type };
    default: throw new Error('Unsupported demo action');
  }
}
function dispatch(workspace, action, now) {
  if (workspace.schemaVersion !== 1 || workspace.mode !== 'local_mock') throw new Error('Unsupported demo workspace');
  const command = normalizeAction(action);
  const expanded = ['tender', 'retender'].includes(command.type) ? { type: command.type, quotes: createMockHaulsmartAdapter().tender(workspace.shipment, now) } : command;
  const shipment = desk.applyAction(workspace.shipment, expanded, workspace.shipment.version, now);
  return { ...workspace, commands: [...workspace.commands, { action: command, at: now }], shipment };
}
function serialize(workspace) {
  return JSON.stringify({ schemaVersion: 1, mode: 'local_mock', seed: workspace.seed, commands: workspace.commands });
}
function restore(raw) {
  if (typeof raw !== 'string' || raw.length > 65536) throw new Error('Invalid demo snapshot size');
  let saved;
  try { saved = JSON.parse(raw); } catch { throw new Error('Invalid demo snapshot JSON'); }
  if (!saved || saved.schemaVersion !== 1 || saved.mode !== 'local_mock' || !saved.seed || !Array.isArray(saved.commands) || saved.commands.length > 100) throw new Error('Unsupported demo snapshot');
  let workspace = createWorkspace(saved.seed.input || {}, saved.seed.id, saved.seed.at);
  for (const command of saved.commands) {
    if (!command || typeof command !== 'object') throw new Error('Invalid saved command');
    workspace = dispatch(workspace, command.action, command.at);
  }
  return workspace;
}
function writeSnapshot(storage, expectedRaw, workspace) {
  if (storage.getItem(KEY) !== expectedRaw) {
    const error = new Error('The saved demonstration changed in another tab. Reload before continuing.');
    error.code = 'STALE_DEMO';
    throw error;
  }
  const raw = serialize(workspace);
  if (raw.length > 65536) throw new Error('Demo snapshot is too large to save');
  storage.setItem(KEY, raw);
  return raw;
}
module.exports = { KEY, createWorkspace, dispatch, serialize, restore, writeSnapshot };
