const { createHash } = require('node:crypto');
function attachments(input = []) {
  if (!Array.isArray(input) || input.length > 3) throw Error('Choose up to three documents');
  return input.map(file => {
    // Reject control characters and path separators in untrusted download names.
    // eslint-disable-next-line no-control-regex
    if (!file || typeof file.name !== 'string' || !/^[^\x00-\x1f\x7f/\\]{1,120}$/.test(file.name) || typeof file.content !== 'string' || file.content.length > 1398104 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content)) throw Error('Invalid document');
    const content = Buffer.from(file.content, 'base64');
    if (!content.length || content.length > 1048576) throw Error('Each document must be 1 MB or smaller');
    const pdf = content.subarray(0,5).toString() === '%PDF-' && /\.pdf$/i.test(file.name);
    const png = content.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) && /\.png$/i.test(file.name);
    const jpeg = content[0] === 255 && content[1] === 216 && content[2] === 255 && /\.jpe?g$/i.test(file.name);
    if (!pdf && !png && !jpeg) throw Error('Use PDF, PNG or JPEG documents');
    // Documents are always authenticated attachment downloads, never inline HTML.
    return { name: file.name, content, mediaType: pdf ? 'application/pdf' : png ? 'image/png' : 'image/jpeg', digest: createHash('sha256').update(content).digest('hex') };
  });
}
module.exports = { attachments };
