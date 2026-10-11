// Provider-neutral local model. No database, network or transport publication.
const currencies = new Set(['GBP', 'EUR', 'USD']);
const copy = (value) => structuredClone(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
function requireState(shipment, states) {
  if (!states.includes(shipment.stage)) throw new Error(`Action unavailable at ${shipment.stage}`);
}
function createShipment(input, id, now) {
  if (!Number.isFinite(Date.parse(now))) throw new Error('Valid creation time required');
  if (!text(id) || !text(input.reference) || !text(input.origin) || !text(input.destination)) throw new Error('Reference and both stops are required');
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) throw new Error('Positive cargo weight required');
  if (!currencies.has(input.currency)) throw new Error('Unsupported currency');
  return { id, reference: input.reference.trim(), origin: input.origin.trim(), destination: input.destination.trim(), weightKg: input.weightKg, currency: input.currency, stage: 'draft', version: 0, quotes: [], events: [{ type: 'created', at: now }], mode: 'local_mock' };
}
function compareQuotes(shipment, now) {
  return shipment.quotes.filter((q) => q.shipmentId === shipment.id && q.currency === shipment.currency && Number.isSafeInteger(q.amountMinor) && q.amountMinor >= 0 && Date.parse(q.expiresAt) > Date.parse(now)).sort((a, b) => a.amountMinor - b.amountMinor);
}
function applyAction(shipment, action, expectedVersion, now) {
  if (shipment.mode !== 'local_mock') throw new Error('Only local mock shipments are supported');
  if (shipment.version !== expectedVersion) throw new Error('Shipment changed; reload before retrying');
  if (!Number.isFinite(Date.parse(now))) throw new Error('Valid event time required');
  if (Date.parse(now) < Date.parse(shipment.events.at(-1).at)) throw new Error('Event time cannot precede shipment history');
  const next = copy(shipment);
  switch (action.type) {
    case 'plan':
      requireState(next, ['draft']);
      if (!text(action.vehicle) || !text(action.collectionDate) || !Number.isFinite(Date.parse(action.collectionDate))) throw new Error('Vehicle and collection date required');
      next.plan = { vehicle: action.vehicle, collectionDate: action.collectionDate };
      next.stage = 'planned';
      break;
    case 'tender':
    case 'retender':
      requireState(next, action.type === 'retender' ? ['quoted'] : ['planned']);
      if (!Array.isArray(action.quotes) || action.quotes.length === 0) throw new Error('Mock quotes required');
      if (action.quotes.some((q) => !q || !text(q.id) || !text(q.carrier) || q.shipmentId !== next.id || q.currency !== next.currency || !Number.isSafeInteger(q.amountMinor) || q.amountMinor < 0 || Date.parse(q.expiresAt) <= Date.parse(now) || !Number.isFinite(Date.parse(q.expiresAt)) || q.mode !== 'local_mock')) throw new Error('Invalid mock quote');
      if (new Set(action.quotes.map((q) => q.id)).size !== action.quotes.length) throw new Error('Duplicate quote');
      next.quotes = copy(action.quotes);
      next.stage = 'quoted';
      break;
    case 'book': {
      requireState(next, ['quoted']);
      const quote = compareQuotes(next, now).find((q) => q.id === action.quoteId);
      if (!quote) throw new Error('Quote is unavailable or expired');
      next.award = copy(quote);
      next.stage = 'booked';
      break;
    }
    case 'depart': requireState(next, ['booked']); next.stage = 'in_transit'; break;
    case 'deliver': requireState(next, ['in_transit']); next.stage = 'delivered'; break;
    case 'receive_pod':
      requireState(next, ['delivered']);
      if (!text(action.documentRef)) throw new Error('POD reference required');
      next.pod = { reference: action.documentRef.trim(), receivedAt: now, mode: 'local_mock' };
      next.stage = 'pod_received';
      break;
    case 'close': requireState(next, ['pod_received']); next.stage = 'closed'; break;
    default: throw new Error('Unknown action');
  }
  next.version += 1;
  next.events.push({ type: action.type, at: now, version: next.version });
  return next;
}
function fromBooking(booking) {
  // Projection only: legacy status is retained, never interpreted as a procurement award.
  return { id: booking.id, reference: booking.consignment_ref || String(booking.id), origin: booking.collections?.[0]?.postcode || '', destination: booking.deliveries?.at(-1)?.postcode || '', status: booking.status || 'unknown', weightKg: booking.weight_kg, mode: 'existing_booking_read_only' };
}
module.exports = { createShipment, applyAction, compareQuotes, fromBooking };
