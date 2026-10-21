const MANUAL_ENQUIRY_EMAIL = 'freight@midnight-express.org';

const clean = (value, limit = 500) => String(value ?? '')
  .replace(/\r\n?/g, '\n')
  .trim()
  .slice(0, limit);

function buildManualEnquiryMailto(fields) {
  const origin = clean(fields.origin, 120);
  const destination = clean(fields.destination, 120);
  const subject = `Freight enquiry: ${origin || 'origin needed'} to ${destination || 'destination needed'}`;
  const body = [
    'Freight enquiry',
    '',
    `Name: ${clean(fields.name, 120)}`,
    `Company: ${clean(fields.company, 160)}`,
    `Reply email: ${clean(fields.replyEmail, 254)}`,
    `Phone: ${clean(fields.phone, 80) || 'Not provided'}`,
    `Collection: ${origin}`,
    `Delivery: ${destination}`,
    `Goods: ${clean(fields.goods, 500)}`,
    `Timing: ${clean(fields.timing, 200) || 'Not specified'}`,
  ].join('\n');

  return `mailto:${MANUAL_ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

module.exports = { buildManualEnquiryMailto, MANUAL_ENQUIRY_EMAIL };
