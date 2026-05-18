ALTER TABLE quote_customers
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

COMMENT ON COLUMN quote_customers.customer_email IS 'From POST /api/quotes customer object (e.g. customerEmail); used in payment-link webhook.';
COMMENT ON COLUMN quote_customers.customer_phone IS 'From POST /api/quotes customer object (e.g. customerPhone); used in payment-link webhook.';
