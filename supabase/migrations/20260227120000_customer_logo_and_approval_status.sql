-- customer_logo on quote_customers; approval_status on quote_products

ALTER TABLE quote_customers
  ADD COLUMN IF NOT EXISTS customer_logo text;

ALTER TABLE quote_products
  ADD COLUMN IF NOT EXISTS approval_status text;

COMMENT ON COLUMN quote_customers.customer_logo IS 'URL of customer logo image';
COMMENT ON COLUMN quote_products.approval_status IS 'One of: approved, alternative, rejected';
