const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const contact = fs.readFileSync(
  path.join(__dirname, '..', 'pages', 'contact.js'),
  'utf8',
);

test('contact prepares a manual operations email without claiming delivery', () => {
  assert.match(contact, /bookings@midnight-express\.org/);
  assert.match(contact, /window\.location\.href = `mailto:/);
  assert.match(contact, /Prepare enquiry email/);
  assert.match(contact, /sent only after you[\s\S]*send it from your email app/);
  assert.doesNotMatch(contact, /alert\(['"]Message sent!/);
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
});
