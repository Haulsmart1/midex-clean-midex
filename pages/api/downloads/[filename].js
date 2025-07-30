import fs from 'fs';
import path from 'path';
import os from 'os';

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(os.tmpdir(), filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/zip');
  fs.createReadStream(filePath).pipe(res);
}
