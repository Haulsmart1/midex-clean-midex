const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
async function load(file, mocks = {}, globals = {}) {
  const root = path.resolve(__dirname, '..');
  const context = vm.createContext({ console: { log() {}, warn() {}, error() {} }, process: { env: {} }, fetch() { throw new Error('Network disabled in local tests'); }, ...globals });
  const cache = new Map();
  function resolve(relative) {
    if (cache.has(relative)) return cache.get(relative);
    let module;
    if (mocks[relative]) {
      const exports = mocks[relative];
      module = new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context });
    } else {
      module = new vm.SourceTextModule(fs.readFileSync(path.join(root, relative), 'utf8'), { context });
    }
    cache.set(relative, module);
    return module;
  }
  const module = resolve(file);
  await module.link((specifier) => {
    if (!specifier.startsWith('@/')) throw new Error(`Unexpected dependency: ${specifier}`);
    return resolve(`${specifier.slice(2)}.js`);
  });
  await module.evaluate();
  return module.namespace;
}
const coords = { M11AE: { lat: 53.48, lon: -2.24 }, SW1A1AA: { lat: 51.50, lon: -0.14 }, D01P3K2: { lat: 53.35, lon: -6.26 }, BT15GS: { lat: 54.60, lon: -5.93 } };
const mockGeocode = { getTomTomCoords: async (postcode) => coords[postcode.replace(/\s/g, '')] };
test('internal route road mileage is charged once and coordinate order is retained', async () => {
  const calls = [];
  const { resolveRoute } = await load('utils/resolveRoute.js', {
    'utils/getTomTomCoords.js': mockGeocode,
    'utils/getTomTomMileage.js': { getTomTomMileage: async (from, to) => {
      calls.push([Array.from(from), Array.from(to)]);
      return { distance: 160934.4, raw: { routes: [{ legs: [{ points: [{ latitude: from[0], longitude: from[1] }, { latitude: to[0], longitude: to[1] }] }] }] } };
    } },
  });
  const route = await resolveRoute({ from: 'M1 1AE', to: 'SW1A 1AA' });
  assert.equal(route.legs.length, 1);
  assert.ok(Math.abs(route.collectionMiles - 100) < 0.0001);
  assert.equal(route.deliveryMiles, 0);
  assert.equal(route.middleMiles, 0);
  assert.deepEqual(calls[0][0], [53.48, -2.24]);
});
test('cross-channel routes partition road miles; unavailable geometry gives explicit fallback', async () => {
  const { resolveRoute } = await load('utils/resolveRoute.js', {
    'utils/getTomTomCoords.js': mockGeocode,
    'utils/getTomTomMileage.js': { getTomTomMileage: async () => { throw new Error('Offline fixture'); } },
  });
  for (const [from, to, fromRegion, toRegion] of [['M1 1AE', 'D01 P3K2', 'GB', 'ROI'], ['M1 1AE', 'BT1 5GS', 'GB', 'NI'], ['BT1 5GS', 'D01 P3K2', 'NI', 'ROI']]) {
    const route = await resolveRoute({ from, to, fromRegion, toRegion });
    assert.ok(Number.isFinite(route.roadMiles));
    assert.ok(Math.abs(route.collectionMiles + route.deliveryMiles + route.middleMiles - route.roadMiles) < 0.000001);
    assert.ok(route.legs.some((leg) => leg.error === 'Offline fixture'));
  }
});
test('TomTom request serializes latitude before longitude with a mocked fetch', async () => {
  let requested;
  const { getTomTomMileage } = await load('utils/getTomTomMileage.js', { 'utils/throttle.js': { throttledRequest: async (_key, fn) => fn() } }, {
    fetch: async (url) => { requested = url; return { ok: true, json: async () => ({ routes: [{ summary: { lengthInMeters: 1000 }, legs: [{ points: [{ latitude: 53.48, longitude: -2.24 }, { latitude: 51.5, longitude: -0.14 }] }] }] }) }; },
  });
  const result = await getTomTomMileage([53.48, -2.24], [51.5, -0.14], 'mock-key');
  assert.ok(requested.includes('/53.48,-2.24:51.5,-0.14/json'));
  assert.equal(result.distance, 1000);
});
test('real pricing engine charges the internal road leg and excludes duplicate delivery mileage', async () => {
  const { default: calculateQuote } = await load('utils/pricingEngine.js');
  const pallets = [{ type: 'standard 120x100', qty: 1, weightKg: 500 }];
  const base = calculateQuote({ pallets, collectionMiles: 0, deliveryMiles: 0 });
  const road = calculateQuote({ pallets, collectionMiles: 100, deliveryMiles: 0, middleMiles: 0 });
  assert.ok(road.collectionFee > 0);
  assert.equal(road.deliveryFee, 0);
  assert.equal(road.middleFee, 0);
  assert.equal(road.totalExVat - base.totalExVat, road.collectionFee);
  assert.ok(Number.isFinite(road.totalIncVat));
});
