const archiver = require('archiver');
const { Writable } = require('stream');

async function buildExportZip(files) {
  const archive = archiver('zip', { zlib: { level: 9 } });

  const zipChunks = [];
  const writable = new Writable({
    write(chunk, encoding, callback) {
      zipChunks.push(chunk);
      callback();
    }
  });

  archive.pipe(writable);

  for (const file of files) {
    const { name, buffer } = file;
    if (!Buffer.isBuffer(buffer)) {
      throw new Error(`❌ File '${name}' content is not a Buffer`);
    }
    archive.append(buffer, { name });
  }

  await archive.finalize();

  return new Promise((resolve, reject) => {
    writable.on('finish', () => {
      resolve({ buffer: Buffer.concat(zipChunks) });
    });
    writable.on('error', reject);
  });
}

module.exports = { buildExportZip };
