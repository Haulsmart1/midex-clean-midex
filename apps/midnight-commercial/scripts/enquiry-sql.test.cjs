// Review-only embedded PostgreSQL. No URLs, network database, SMTP or migrations on a service.
// One serialized backend: this is NOT evidence of multi-session locks or durability.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { migrate } = require('./migrate-enquiries.cjs');
const { repository } = require('../lib/server/enquiryRepository.cjs');

test('actual migrations and repository: restricted-role capture, retry, rollback, audit and immutable submissions', async () => {
  const db = new PGlite();
  const query = async (sql, args) => {
    // pg uses simple-query protocol for parameterless multi-statement migrations.
    // Preserve that behavior with exec; parameterized repository SQL stays prepared.
    if (args === undefined) {
      const results = await db.exec(sql);
      const result = results.at(-1) || { rows: [], affectedRows: 0 };
      return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
    }
    const result = await db.query(sql, args);
    return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
  };
  const adapter = { query, connect: async () => ({ query, release() {} }) };
  try {
    await db.exec('CREATE ROLE midnight_capture NOLOGIN');
    await migrate(adapter);
    await migrate(adapter);
    assert.equal((await query('SELECT * FROM midnight_migrations.applied')).rowCount, 3);
    await db.exec('SET ROLE midnight_capture');
    const repo = repository(adapter);
    const args = {
      requestKey: randomUUID(), fingerprint: 'fixture-fingerprint',
      data: { name: 'Synthetic review only', mode: 'Road' }, notification: 'disabled',
      rates: [{ key: randomUUID(), limit: 1 }],
      files: [{ name: 'fixture.pdf', mediaType: 'application/pdf', digest: 'fixture', content: Buffer.from('%PDF-1.4\n%%EOF') }],
    };
    const original = await repo.capture(args);
    for (let i = 0; i < 7; i++) assert.equal((await repo.capture(args)).reference, original.reference);
    assert.equal((await repo.capture({ ...args, fingerprint: 'changed' })).conflict, true);
    assert.equal((await repo.capture({ ...args, requestKey: randomUUID() })).limited, true);
    const detail = await repo.detail(original.reference);
    assert.equal(detail.attachments.length, 1);
    assert.equal(detail.audit.length, 1);
    assert.equal(detail.details.name, args.data.name);
    const attachment = await repo.download(original.reference, detail.attachments[0].id);
    assert.equal(Buffer.from(attachment.content).toString(), args.files[0].content.toString());
    assert.equal(await repo.download('MID-' + '0'.repeat(32), detail.attachments[0].id), undefined);
    assert.equal(await repo.claim(original.reference, 'fixture-operator'), true);
    assert.equal(await repo.claim(original.reference, 'fixture-operator'), false);
    await repo.finish(original.reference, 'uncertain', null, 'fixture-operator');
    assert.equal(await repo.claim(original.reference, 'fixture-operator'), false);
    assert.deepEqual(await repo.changeStatus(original.reference, 'new', 'reviewing', 'fixture-operator'), { status: 'reviewing' });
    assert.deepEqual(await repo.changeStatus(original.reference, 'new', 'quoted', 'other-fixture'), { conflict: true });
    assert.equal((await repo.detail(original.reference)).audit.filter(e => e.event === 'status_changed').length, 1);
    const rejectedKey = randomUUID();
    await assert.rejects(repo.capture({ ...args, requestKey: rejectedKey, rates: [], files: [{ ...args.files[0], content: Buffer.alloc(1048577) }] }));
    assert.equal((await query('SELECT reference FROM midnight_enquiries.enquiries WHERE request_key=$1', [rejectedKey])).rowCount, 0);
    await assert.rejects(query('UPDATE midnight_enquiries.enquiries SET details=$2 WHERE reference=$1', [original.reference, {}]), /immutable/);
    await assert.rejects(query('DELETE FROM midnight_enquiries.enquiries WHERE false'), /permission/);
    await assert.rejects(query('TRUNCATE midnight_enquiries.enquiries'), /permission/);
    await assert.rejects(query('CREATE TABLE midnight_enquiries.forbidden (id int)'), /permission/);
    await db.exec('RESET ROLE');
    assert.equal((await query('SELECT count(*)::int AS n FROM midnight_enquiries.enquiries')).rows[0].n, 1);
  } finally {
    await db.close();
  }
});
