BEGIN;
CREATE OR REPLACE FUNCTION midnight_enquiries.preserve_submission() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference IS DISTINCT FROM OLD.reference OR NEW.request_key IS DISTINCT FROM OLD.request_key
    OR NEW.fingerprint IS DISTINCT FROM OLD.fingerprint OR NEW.details IS DISTINCT FROM OLD.details
    OR NEW.product IS DISTINCT FROM OLD.product OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.source IS DISTINCT FROM OLD.source THEN
    RAISE EXCEPTION 'Original enquiry submission is immutable';
  END IF;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION midnight_enquiries.preserve_submission() FROM PUBLIC;
CREATE TRIGGER preserve_original_submission BEFORE UPDATE ON midnight_enquiries.enquiries
FOR EACH ROW EXECUTE FUNCTION midnight_enquiries.preserve_submission();
COMMIT;
