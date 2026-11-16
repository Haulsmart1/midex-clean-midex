const { Pool } = require('pg');
const { randomUUID } = require('node:crypto');
const { databaseConnection } = require('./enquiryDatabaseConfig.cjs');
let pool;
function getPool() {
  const connectionString = databaseConnection(process.env);
  if (!pool) {
    pool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, statement_timeout: 8000, query_timeout: 10000 });
    pool.on('error',()=>{});
  }
  return pool;
}
function repository(db = getPool()) {
  return {
    async capture({ requestKey, fingerprint, data, files, rates, notification }) {
      const c = await db.connect();
      try {
        await c.query('BEGIN');
        // Recover an existing receipt before charging another submission attempt.
        // Keep the lookup under the same lock as inserts for concurrent retries.
        await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [requestKey]);
        const previous = await c.query('SELECT reference, fingerprint, notification FROM midnight_enquiries.enquiries WHERE request_key=$1', [requestKey]);
        if (previous.rowCount) { await c.query('COMMIT'); return previous.rows[0].fingerprint === fingerprint ? previous.rows[0] : { conflict: true }; }
        for (const { key, limit } of rates) {
          const r = await c.query(`INSERT INTO midnight_enquiries.rate_limits AS r VALUES ($1, now(), 1)
            ON CONFLICT (key) DO UPDATE SET window_start = CASE WHEN r.window_start < now()-interval '10 minutes' THEN now() ELSE r.window_start END,
            attempts = CASE WHEN r.window_start < now()-interval '10 minutes' THEN 1 ELSE r.attempts+1 END RETURNING attempts`, [key]);
          if (r.rows[0].attempts > limit) { await c.query('COMMIT'); return { limited: true }; }
        }
        const reference = 'MID-' + randomUUID().replaceAll('-','').toUpperCase();
        await c.query('INSERT INTO midnight_enquiries.enquiries (reference,request_key,fingerprint,details,notification) VALUES ($1,$2,$3,$4,$5)', [reference,requestKey,fingerprint,data,notification]);
        for (const f of files) await c.query('INSERT INTO midnight_enquiries.attachments VALUES ($1,$2,$3,$4,$5,$6)', [randomUUID(),reference,f.name,f.mediaType,f.digest,f.content]);
        await c.query("INSERT INTO midnight_enquiries.audit (enquiry_reference,event,actor) VALUES ($1,'captured','customer')", [reference]);
        await c.query('COMMIT');
        return { reference, notification };
      } catch (error) { await c.query('ROLLBACK').catch(()=>{}); throw error; } finally { c.release(); }
    },
    async claim(reference, actor) {
      const r = await db.query(`WITH claimed AS (
        UPDATE midnight_enquiries.enquiries SET notification='sending', attempts=attempts+1, notification_updated_at=now()
        WHERE reference=$1 AND notification IN ('pending','disabled','failed') AND attempts<3
        AND (notification_updated_at IS NULL OR notification_updated_at < now()-interval '1 minute') RETURNING *)
        INSERT INTO midnight_enquiries.audit (enquiry_reference,event,actor)
        SELECT reference,'notification_started',$2 FROM claimed RETURNING enquiry_reference`, [reference,actor]);
      return Boolean(r.rowCount);
    },
    async finish(reference, state, providerReference, actor) {
      await db.query(`WITH changed AS (UPDATE midnight_enquiries.enquiries SET notification=$2,provider_reference=$3,notification_updated_at=now()
        WHERE reference=$1 AND notification='sending' RETURNING reference)
        INSERT INTO midnight_enquiries.audit (enquiry_reference,event,actor) SELECT reference,$2,$4 FROM changed`, [reference,state,providerReference || null,actor]);
    },
    async list(before, reference, filters = {}) {
      return (await db.query(`SELECT reference, created_at, created_at::text AS cursor_time, status, details, notification FROM midnight_enquiries.enquiries
        WHERE ($1::timestamptz IS NULL OR created_at<$1 OR (created_at=$1 AND reference<$2))
        AND ($3='' OR strpos(lower(reference || ' ' || coalesce(details->>'name','') || ' ' || coalesce(details->>'company','')),lower($3))>0)
        AND ($4='' OR details->>'mode'=$4) AND ($5='' OR status=$5) AND ($6='' OR details->>'dangerousGoods'=$6)
        AND ($7::date IS NULL OR created_at >= $7::date) AND ($8::date IS NULL OR created_at < $8::date + interval '1 day')
        ORDER BY created_at DESC, reference DESC LIMIT 51`, [before || null, reference || '',filters.q || '',filters.mode || '',filters.status || '',filters.dg || '',filters.from || null,filters.to || null])).rows;
    },
    async changeStatus(reference, expected, status, actor) {
      if (!['new','open','reviewing','quoted','booked','closed','declined'].includes(status) || !actor) throw Error('Invalid status change');
      const c=await db.connect();
      try {
        await c.query('BEGIN');
        const row=(await c.query('SELECT status FROM midnight_enquiries.enquiries WHERE reference=$1 FOR UPDATE',[reference])).rows[0];
        if (!row) {await c.query('COMMIT');return {missing:true};}
        if (row.status===status) {await c.query('COMMIT');return {status};}
        if (row.status!==expected) {await c.query('COMMIT');return {conflict:true};}
        await c.query('UPDATE midnight_enquiries.enquiries SET status=$2,updated_at=now() WHERE reference=$1',[reference,status]);
        await c.query("INSERT INTO midnight_enquiries.audit (enquiry_reference,event,actor,metadata) VALUES ($1,'status_changed',$2,$3)",[reference,actor,{from:expected,to:status}]);
        await c.query('COMMIT');return {status};
      } catch(error) {await c.query('ROLLBACK').catch(()=>{});throw error;} finally {c.release();}
    },
    async detail(reference) {
      const row = (await db.query('SELECT reference,created_at,status,details,notification,attempts,notification_updated_at FROM midnight_enquiries.enquiries WHERE reference=$1',[reference])).rows[0];
      if (!row) return null;
      row.attachments = (await db.query('SELECT id,name,media_type,octet_length(content) AS size FROM midnight_enquiries.attachments WHERE enquiry_reference=$1',[reference])).rows;
      row.audit = (await db.query('SELECT occurred_at,event,actor,metadata FROM midnight_enquiries.audit WHERE enquiry_reference=$1 ORDER BY id DESC LIMIT 50',[reference])).rows;
      return row;
    },
    async download(reference,id) { return (await db.query('SELECT name,media_type,content FROM midnight_enquiries.attachments WHERE enquiry_reference=$1 AND id=$2',[reference,id])).rows[0]; },
  };
}
module.exports = { repository, getPool };
