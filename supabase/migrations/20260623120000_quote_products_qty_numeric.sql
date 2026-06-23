-- CRM payloads send fractional quantities (e.g. 43.5 m²). integer rejected PostgREST inserts.
ALTER TABLE quote_products
  ALTER COLUMN qty TYPE numeric(12, 4) USING qty::numeric(12, 4);

COMMENT ON COLUMN quote_products.qty IS 'Line quantity; may be fractional (area units).';
