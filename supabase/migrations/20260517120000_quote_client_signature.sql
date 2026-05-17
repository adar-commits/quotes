-- Persist client quote signature (PNG data URL + signer fields) after signing
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signature_payload jsonb;

COMMENT ON COLUMN quotes.signed_at IS 'When the customer completed signing (server time)';
COMMENT ON COLUMN quotes.signature_payload IS 'JSON: signerName, companyName, companyReg, imagePngDataUrl';
