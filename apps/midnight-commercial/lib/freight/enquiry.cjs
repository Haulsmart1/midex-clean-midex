const fields = {
  mode: 20, collection: 200, delivery: 200, ready: 100, deadline: 150,
  description: 1000, pieces: 30, dimensions: 200, weight: 60, urgency: 30,
  name: 120, company: 160, email: 254, phone: 60, notes: 2000,
  dangerousGoods: 20, unNumber: 40, shippingName: 200, dgClass: 40,
  packingGroup: 40, quantity: 100, packaging: 200, documents: 100,
};
const labels = { mode: 'Transport mode', collection: 'Collection', delivery: 'Delivery', ready: 'Cargo-ready date/time (local)', deadline: 'Required delivery window', description: 'Freight description', pieces: 'Pieces', dimensions: 'Dimensions and units', weight: 'Total weight and units', urgency: 'Urgency', name: 'Contact name', company: 'Company', email: 'Email', phone: 'Telephone', notes: 'Additional notes', dangerousGoods: 'Dangerous goods', unNumber: 'UN number', shippingName: 'Proper shipping name', dgClass: 'DG class', packingGroup: 'Packing group', quantity: 'DG quantity', packaging: 'Packaging', documents: 'SDS / DGN availability' };
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i;
const dgFields = ['unNumber', 'shippingName', 'dgClass', 'packingGroup', 'quantity', 'packaging', 'documents'];
function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid enquiry');
  const data = {};
  for (const [key, limit] of Object.entries(fields)) {
    if (input[key] != null && typeof input[key] !== 'string') throw new Error('Invalid ' + labels[key]);
    const value = (input[key] || '').trim();
    if (value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error('Invalid ' + labels[key]);
    data[key] = value;
  }
  for (const key of ['mode', 'collection', 'delivery', 'description', 'name', 'email']) if (!data[key]) throw new Error(labels[key] + ' is required');
  if (!['Road', 'Air', 'Sea', 'Please advise'].includes(data.mode)) throw new Error('Choose a transport mode');
  if (!['No', 'Yes', 'Unsure'].includes(data.dangerousGoods)) throw new Error('Choose a dangerous-goods indication');
  if (!['Standard', 'Urgent', 'Time-critical'].includes(data.urgency)) throw new Error('Choose an urgency');
  if (!emailPattern.test(data.email)) throw new Error('Enter a valid email address');
  data.email = data.email.toLowerCase();
  if (data.dangerousGoods === 'No') for (const key of dgFields) data[key] = '';
  return data;
}
function brief(data) {
  return ['Midnight freight enquiry — quotation and availability require operations confirmation',
    ...Object.keys(fields).filter(key => data[key] && (data.dangerousGoods !== 'No' || !dgFields.includes(key))).map(key => labels[key] + ': ' + data[key]),
    'Dangerous-goods acceptance, routing and final quotation must be confirmed individually.'].join('\n');
}
module.exports = { emailPattern, fields, labels, dgFields, normalize, brief };
