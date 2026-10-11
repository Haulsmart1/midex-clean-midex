// Versioned adapter contract; intentionally has no live implementation or credentials.
function createMockHaulsmartAdapter() {
  return {
    name: 'Haulsmart local mock', contractVersion: 1, mode: 'local_mock',
    tender(shipment, now) {
      if (shipment.mode !== 'local_mock' || !['planned', 'quoted'].includes(shipment.stage)) throw new Error('Planned or quoted local shipment required');
      if (!Number.isFinite(Date.parse(now))) throw new Error('Valid quote time required');
      const expiresAt = new Date(Date.parse(now) + 24 * 60 * 60 * 1000).toISOString();
      return [
        { carrier: 'Demo approved carrier A', amountMinor: 42000 },
        { carrier: 'Demo approved carrier B', amountMinor: 39500 },
        { carrier: 'Demo approved carrier C', amountMinor: 46500 },
      ].map((quote, index) => ({ ...quote, id: `${shipment.id}:mock:${index + 1}`, shipmentId: shipment.id, currency: shipment.currency, expiresAt, mode: 'local_mock', provider: 'haulsmart_mock', contractVersion: 1 }));
    },
  };
}
module.exports = { createMockHaulsmartAdapter };
