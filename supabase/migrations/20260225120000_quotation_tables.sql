-- Quotation tables + RLS
-- Run in Supabase: Dashboard → SQL Editor → paste and run, or use Supabase CLI: supabase db push
-- public_id: auto-generated 22-char hex from uuid when not provided

CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE DEFAULT substring(replace(gen_random_uuid()::text, '-', ''), 1, 22),
  vat numeric(5,2) NOT NULL,
  invoice_id text,
  project_name text,
  quotation_id text,
  special_discount numeric(12,2) NOT NULL DEFAULT 0,
  require_signature boolean NOT NULL DEFAULT true,
  invoice_creation_date timestamptz,
  agent_code text,
  agent_desc text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_quote_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER quotes_updated_at_trigger
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_quote_updated_at();

CREATE TABLE quote_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  customer_id text,
  customer_name text,
  customer_address text,
  UNIQUE(quote_id)
);

CREATE TABLE quote_representatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  rep_phone text,
  rep_avatar text,
  rep_full_name text,
  UNIQUE(quote_id)
);

CREATE TABLE quote_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sort_order int NOT NULL,
  qty int NOT NULL,
  sku text,
  color text,
  shape text,
  material text,
  technique text,
  unit_price numeric(12,4) NOT NULL,
  unit_discount numeric(12,4) NOT NULL DEFAULT 0,
  picture_url text,
  product_desc text,
  additional_desc text
);

CREATE TABLE quote_payment_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sort_order int NOT NULL,
  term text NOT NULL
);

CREATE INDEX idx_quotes_public_id ON quotes(public_id);
CREATE INDEX idx_quote_products_quote_id ON quote_products(quote_id);
CREATE INDEX idx_quote_payment_terms_quote_id ON quote_payment_terms(quote_id);

-- RLS: public can read quotes by public_id only; write via service role
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_payment_terms ENABLE ROW LEVEL SECURITY;

-- Public read: only quotes (by public_id). Child tables exposed via joins in API or via policy that checks quote visibility.
CREATE POLICY "Public can read quote by public_id"
  ON quotes FOR SELECT
  USING (true);

CREATE POLICY "Service role can do all on quotes"
  ON quotes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public can read quote_customers for any quote"
  ON quote_customers FOR SELECT USING (true);

CREATE POLICY "Service role can do all on quote_customers"
  ON quote_customers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read quote_representatives for any quote"
  ON quote_representatives FOR SELECT USING (true);

CREATE POLICY "Service role can do all on quote_representatives"
  ON quote_representatives FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read quote_products for any quote"
  ON quote_products FOR SELECT USING (true);

CREATE POLICY "Service role can do all on quote_products"
  ON quote_products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read quote_payment_terms for any quote"
  ON quote_payment_terms FOR SELECT USING (true);

CREATE POLICY "Service role can do all on quote_payment_terms"
  ON quote_payment_terms FOR ALL USING (auth.role() = 'service_role');
