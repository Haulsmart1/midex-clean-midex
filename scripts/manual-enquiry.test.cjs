const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildManualEnquiryMailto, MANUAL_ENQUIRY_EMAIL } = require('../lib/manualEnquiry.cjs');

test('manual enquiry prepares the required freight details for operations', () => {
  const href = buildManualEnquiryMailto({
    name: 'Alex Driver', company: 'Example Logistics', replyEmail: 'alex@example.com',
    phone: '01234 567890', origin: 'Birmingham', destination: 'Rotterdam',
    goods: 'Two standard pallets', timing: 'Collection next Tuesday',
  });
  assert.ok(href.startsWith(`mailto:${MANUAL_ENQUIRY_EMAIL}?`));
  const query = new URLSearchParams(href.split('?')[1]);
  assert.equal(query.get('subject'), 'Freight enquiry: Birmingham to Rotterdam');
  assert.match(query.get('body'), /Company: Example Logistics/);
  assert.match(query.get('body'), /Goods: Two standard pallets/);
  assert.match(query.get('body'), /Timing: Collection next Tuesday/);
});

test('manual enquiry normalises input and bounds the generated draft', () => {
  const href = buildManualEnquiryMailto({
    name: '  Alex\r\nDriver  ', company: 'Midnight', replyEmail: 'alex@example.com',
    origin: 'Leeds\r\n', destination: 'Paris', goods: 'x'.repeat(800),
  });
  const query = new URLSearchParams(href.split('?')[1]);
  assert.equal(query.get('subject'), 'Freight enquiry: Leeds to Paris');
  assert.match(query.get('body'), /Name: Alex\nDriver/);
  assert.doesNotMatch(query.get('body'), /x{501}/);
  assert.match(query.get('body'), /Phone: Not provided/);
  assert.match(query.get('body'), /Timing: Not specified/);
});

test('contact route cannot claim submission and is discoverable from the freight footer', () => {
  const root = path.join(__dirname, '..');
  const page = fs.readFileSync(path.join(root, 'pages/contact.js'), 'utf8');
  const layout = fs.readFileSync(path.join(root, 'components/freight/FreightLayout.js'), 'utf8');
  assert.doesNotMatch(page, /Message sent!/);
  assert.match(page, /not submitted until you send/i);
  assert.match(page, /does not create an automated booking/i);
  assert.match(layout, /href="\/contact"/);
});
