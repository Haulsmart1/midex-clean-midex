-- Dedicated Midnight database only. Apply using the migration owner.
BEGIN;
CREATE SCHEMA IF NOT EXISTS midnight_enquiries;
REVOKE ALL ON SCHEMA midnight_enquiries FROM PUBLIC;
CREATE TABLE IF NOT EXISTS midnight_enquiries.enquiries (
  reference text PRIMARY KEY,
  request_key text NOT NULL UNIQUE,
  fingerprint text NOT NULL,
  product text NOT NULL DEFAULT 'MIDNIGHT' CHECK (product = 'MIDNIGHT'),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','open','closed')),
  details jsonb NOT NULL,
  notification text NOT NULL DEFAULT 'pending' CHECK (notification IN ('pending','disabled','sending','accepted','failed','uncertain')),
  attempts integer NOT NULL DEFAULT 0,
  notification_updated_at timestamptz,
  provider_reference text
);
CREATE INDEX IF NOT EXISTS enquiry_created ON midnight_enquiries.enquiries (created_at DESC);
CREATE TABLE IF NOT EXISTS midnight_enquiries.attachments (
  id uuid PRIMARY KEY,
  enquiry_reference text NOT NULL REFERENCES midnight_enquiries.enquiries(reference),
  name text NOT NULL,
  media_type text NOT NULL,
  digest text NOT NULL,
  content bytea NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 1048576)
);
CREATE TABLE IF NOT EXISTS midnight_enquiries.audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  enquiry_reference text NOT NULL REFERENCES midnight_enquiries.enquiries(reference),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event text NOT NULL,
  actor text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS midnight_enquiries.rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL
);
REVOKE ALL ON ALL TABLES IN SCHEMA midnight_enquiries FROM PUBLIC;
COMMIT;
