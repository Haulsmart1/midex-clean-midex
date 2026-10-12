const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Next optimizer resizes recovered JPEG and encodes WebP with patched Sharp', async () => {
  const { optimizeImage, getSharp } = require('next/dist/server/image-optimizer');
  const sharp = getSharp();
  assert.equal(sharp.versions.sharp, '0.35.5');
  const buffer = await optimizeImage({buffer: fs.readFileSync('public/midex.jpg'), contentType:'image/webp',quality:75,width:320});
  const metadata = await sharp(buffer).metadata();
  assert.equal(metadata.width,320);
  assert.equal(metadata.format,'webp');
});

test('NextAuth sign-in rendering works with patched Preact', () => {
  const {h} = require('preact');
  const render = require('preact-render-to-string');
  const html = render(h('form',{method:'post'},h('input',{name:'email',value:'<local@example.invalid>'})));
  assert.match(html,/method="post"/);
  assert.match(html,/&lt;local@example.invalid/);
  assert.doesNotMatch(html,/<local@example.invalid/);
  assert.equal(typeof require('next-auth/next').getServerSession,'function');
});

test('Stripe serializer retains nested checkout fields with patched qs', () => {
  const qs = require('qs');
  const payload = {line_items:[{price_data:{currency:'gbp',unit_amount:1200},quantity:1}],metadata:{booking_id:'offline-booking'}};
  assert.equal(qs.parse(qs.stringify(payload)).line_items[0].price_data.unit_amount,'1200');
  const Stripe=require('stripe');
  const stripe=new Stripe('offline-validation-only');
  assert.equal(typeof stripe.checkout.sessions.create,'function');
});

test('Supabase and Postgres resolve the patched WebSocket client', () => {
  for(const pkg of ['@supabase/realtime-js','@vercel/postgres']) {
    const owner=path.join(process.cwd(),'node_modules',pkg);
    const entry=require.resolve('ws',{paths:[owner]});
    const manifest=JSON.parse(fs.readFileSync(path.join(path.dirname(entry),'package.json')));
    assert.equal(manifest.version,'8.22.0');
    const WebSocket=require(entry);
    assert.equal(WebSocket.OPEN,1);
    assert.equal(typeof WebSocket.Receiver,'function');
  }
});

test('patched protocol schema parser keeps the map codec schema contract', () => {
  const schema=require('protocol-buffers-schema');
  const parsed=schema.parse('syntax = "proto2"; message Point { required int32 latitude = 1; optional int32 longitude = 2; }');
  assert.equal(parsed.messages[0].name,'Point');
  assert.equal(parsed.messages[0].fields[0].name,'latitude');
});

test('patched Lodash preserves map configuration merging without prototype pollution', () => {
  const _=require('lodash');
  assert.equal(_.VERSION,'4.18.1');
  const target=_.merge({}, {map:{center:[-2,53],zoom:6}}, {map:{zoom:7}});
  assert.deepEqual(target,{map:{center:[-2,53],zoom:7}});
  const polluted=_.merge({},JSON.parse('{"__proto__":{"releasePolluted":true}}'));
  assert.equal({}.releasePolluted,undefined);
  assert.equal(Object.hasOwn(polluted,'releasePolluted'),false);
});
