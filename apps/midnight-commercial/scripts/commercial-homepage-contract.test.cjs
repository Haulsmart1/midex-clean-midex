const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}

test('homepage is the independent Midnight Commercial design, not the legacy countdown homepage',()=>{
  const home=read('pages/index.js');
  const freight=read('components/freight/FreightHomepage.js');
  assert.match(home,/FreightHomepage/);
  assert.match(freight,/EUROPEAN/);
  assert.match(freight,/AIR\. SEA\. ROAD\./);
  assert.doesNotMatch(home,/CountdownClock|ROUTES\.length|routeBadge/);
});

test('approved customer enquiry email is Hazload across layout and homepage metadata',()=>{
  const layout=read('components/freight/FreightLayout.js');
  const home=read('components/freight/FreightHomepage.js');
  assert.match(layout,/mailto:hazload@adrcarriers\.net/);
  assert.match(layout,/>hazload@adrcarriers\.net<\/a>/);
  assert.match(home,/email:'hazload@adrcarriers\.net'/);
  assert.doesNotMatch(layout,/mailto:freight@midnight-express\.org/);
  const enquiry=read('pages/enquiry.js');
  assert(enquiry.includes('mailto:hazload@adrcarriers.net'));
  assert(!enquiry.includes('freight@midnight-express.org'));
});

test('new booking/contact pages route to the dedicated enquiry process',()=>{
  const booking=read('pages/booking.js');
  const contact=read('pages/contact.js');
  assert.match(booking,/destination:'\/enquiry'/);
  assert.match(contact,/from '\.\/enquiry'/);
  const endpoint=read('pages/api/enquiry.js');
  assert.match(endpoint,/MIDNIGHT_ENQUIRY_EMAIL_ENABLED:'false'/);
  assert.match(endpoint,/createHandler/);
});
