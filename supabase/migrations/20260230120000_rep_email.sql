-- Representative email for quote JSON repEmail
ALTER TABLE quote_representatives
  ADD COLUMN IF NOT EXISTS rep_email text;

COMMENT ON COLUMN quote_representatives.rep_email IS 'From JSON Representative.repEmail';
