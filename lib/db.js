// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const sql = (text, params) => pool.query(text, params);
export const query = sql;
