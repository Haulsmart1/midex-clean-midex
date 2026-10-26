const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const contact = fs.readFileSync(
  path.join(root, 'pages', 'contact.js'),
  'utf8',
);
const document = fs.readFileSync(
  path.join(root, 'pages', '_document.js'),
  'utf8',
);
const home = fs.readFileSync(
  path.join(root, 'pages', 'index.js'),
  'utf8',
);

test('contact prepares a manual operations email without claiming delivery', () => {
  assert.match(contact, /bookings@midnight-express\.org/);
  assert.match(contact, /window\.location\.href = `mailto:/);
  assert.match(contact, /Prepare enquiry email/);
  assert.match(contact, /sent only after you[\s\S]*send it from your email app/);
  assert.match(contact, /Nothing has been submitted by this website/);
  assert.doesNotMatch(contact, /alert\(['"]Message sent!/);
  assert.doesNotMatch(contact, /fetch\(['"]\/api\/contact/);
});

test('contact does not represent enquiry as an automated transaction', () => {
  assert.match(contact, /does not create a booking, price, invoice or payment/);
  assert.match(contact, /confirmed by a person after review/);
});

test('contact metadata describes a human-reviewed enquiry, not automated booking', () => {
  assert.match(contact, /Request a Freight Quote \| Midnight Express/);
  assert.match(contact, /Send a freight enquiry to Midnight Express for human review/);
  assert.match(contact, /does not create a booking or take payment/);
  assert.doesNotMatch(contact, /express pallet booking/i);
  assert.doesNotMatch(document, /name="description"|express pallet booking/i);
});

test('unused unsafe legacy contact API is absent from the candidate', () => {
  assert.equal(fs.existsSync(path.join(root, 'pages', 'api', 'contact.js')), false);
});

test('public manual-enquiry journey does not advertise unverified account access', () => {
  assert.doesNotMatch(home, /href=["']\/login["']/);
  assert.doesNotMatch(contact, /href=["']\/login["']/);
  assert.equal(fs.existsSync(path.join(root, 'pages', 'login.js')), true);
});
