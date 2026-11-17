const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const files = ['midnight-enquiries.sql','midnight-operations-workflow.sql','midnight-enquiry-immutability.sql'];
async function migrate(db) {
  await db.query('BEGIN');
  try {
    await db.query("SELECT pg_advisory_xact_lock(hashtextextended('midnight-versioned-migrations',0))");
    await db.query('CREATE SCHEMA IF NOT EXISTS midnight_migrations');
    await db.query('REVOKE ALL ON SCHEMA midnight_migrations FROM PUBLIC');
    await db.query('CREATE TABLE IF NOT EXISTS midnight_migrations.applied (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const name of files) {
      const source=fs.readFileSync(path.join(__dirname,'../database',name),'utf8').replace(/\r\n/g,'\n');
      const checksum=createHash('sha256').update(source).digest('hex');
      const previous=await db.query('SELECT checksum FROM midnight_migrations.applied WHERE name=$1',[name]);
      if (previous.rowCount) {
        if (previous.rows[0].checksum !== checksum) throw Error('Applied migration checksum mismatch');
        continue;
      }
      await db.query(source.replace(/^BEGIN;\s*$/gm,'').replace(/^COMMIT;\s*$/gm,''));
      await db.query('INSERT INTO midnight_migrations.applied (name,checksum) VALUES ($1,$2)',[name,checksum]);
    }
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; }
}
if (require.main === module) {
  (async()=>{
    const env=process.env,url=new URL(env.MIDNIGHT_MIGRATION_DATABASE_URL || '');
    if (env.VERCEL_ENV==='production' || !env.MIDNIGHT_MIGRATION_EXPECTED_HOST || url.hostname!==env.MIDNIGHT_MIGRATION_EXPECTED_HOST || !/^\/midnight_(enquiries|enquiries_live|migration_acceptance_[a-z0-9_]+)$/.test(url.pathname)) throw Error('Isolated Midnight migration target required');
    const {Client}=require('pg');const db=new Client({connectionString:url.href,connectionTimeoutMillis:5000,statement_timeout:20000});
    try {await db.connect();await migrate(db);console.log('Midnight versioned migrations verified');} finally {await db.end();}
  })().catch(()=>{console.error('Midnight migration refused or failed; no credentials logged.');process.exitCode=1;});
}
module.exports={migrate,files};
