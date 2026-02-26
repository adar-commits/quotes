-- One example quote per template for testing (run once).
-- View at: /{public_id} e.g. /test-redcarpet, /test-pozitive, /test-elite

INSERT INTO quotes (public_id, vat, project_name, template_id)
SELECT 'test-redcarpet', 17, 'דוגמה Red Carpet', id FROM quote_templates WHERE template_key = 'redcarpet' LIMIT 1
ON CONFLICT (public_id) DO NOTHING;

INSERT INTO quotes (public_id, vat, project_name, template_id)
SELECT 'test-pozitive', 17, 'דוגמה Pozitive', id FROM quote_templates WHERE template_key = 'pozitive' LIMIT 1
ON CONFLICT (public_id) DO NOTHING;

INSERT INTO quotes (public_id, vat, project_name, template_id)
SELECT 'test-elite', 17, 'דוגמה Elite Rugs', id FROM quote_templates WHERE template_key = 'elite_rugs' LIMIT 1
ON CONFLICT (public_id) DO NOTHING;

-- quote_customers (one per quote)
INSERT INTO quote_customers (quote_id, customer_name, customer_address)
SELECT id, 'לקוח לדוגמה', 'רחוב הדוגמה 1, תל אביב' FROM quotes WHERE public_id = 'test-redcarpet'
ON CONFLICT (quote_id) DO UPDATE SET customer_name = EXCLUDED.customer_name, customer_address = EXCLUDED.customer_address;

INSERT INTO quote_customers (quote_id, customer_name, customer_address)
SELECT id, 'לקוח לדוגמה', 'רחוב הדוגמה 1, תל אביב' FROM quotes WHERE public_id = 'test-pozitive'
ON CONFLICT (quote_id) DO UPDATE SET customer_name = EXCLUDED.customer_name, customer_address = EXCLUDED.customer_address;

INSERT INTO quote_customers (quote_id, customer_name, customer_address)
SELECT id, 'לקוח לדוגמה', 'רחוב הדוגמה 1, תל אביב' FROM quotes WHERE public_id = 'test-elite'
ON CONFLICT (quote_id) DO UPDATE SET customer_name = EXCLUDED.customer_name, customer_address = EXCLUDED.customer_address;

-- quote_representatives (one per quote)
INSERT INTO quote_representatives (quote_id, rep_full_name, rep_phone)
SELECT id, 'מפיק ההצעה', '03-1234567' FROM quotes WHERE public_id = 'test-redcarpet'
ON CONFLICT (quote_id) DO UPDATE SET rep_full_name = EXCLUDED.rep_full_name, rep_phone = EXCLUDED.rep_phone;

INSERT INTO quote_representatives (quote_id, rep_full_name, rep_phone)
SELECT id, 'מפיק ההצעה', '03-1234567' FROM quotes WHERE public_id = 'test-pozitive'
ON CONFLICT (quote_id) DO UPDATE SET rep_full_name = EXCLUDED.rep_full_name, rep_phone = EXCLUDED.rep_phone;

INSERT INTO quote_representatives (quote_id, rep_full_name, rep_phone)
SELECT id, 'מפיק ההצעה', '03-1234567' FROM quotes WHERE public_id = 'test-elite'
ON CONFLICT (quote_id) DO UPDATE SET rep_full_name = EXCLUDED.rep_full_name, rep_phone = EXCLUDED.rep_phone;

-- quote_products (one product per quote)
INSERT INTO quote_products (quote_id, sort_order, qty, unit_price, unit_discount, product_desc, sku)
SELECT id, 1, 2, 500, 0, 'מוצר לדוגמה', 'SKU-001' FROM quotes WHERE public_id = 'test-redcarpet';

INSERT INTO quote_products (quote_id, sort_order, qty, unit_price, unit_discount, product_desc, sku)
SELECT id, 1, 2, 500, 0, 'מוצר לדוגמה', 'SKU-001' FROM quotes WHERE public_id = 'test-pozitive';

INSERT INTO quote_products (quote_id, sort_order, qty, unit_price, unit_discount, product_desc, sku)
SELECT id, 1, 2, 500, 0, 'מוצר לדוגמה', 'SKU-001' FROM quotes WHERE public_id = 'test-elite';

-- quote_payment_terms (one term per quote)
INSERT INTO quote_payment_terms (quote_id, sort_order, term)
SELECT id, 1, 'תשלום בתוך 30 יום' FROM quotes WHERE public_id = 'test-redcarpet';

INSERT INTO quote_payment_terms (quote_id, sort_order, term)
SELECT id, 1, 'תשלום בתוך 30 יום' FROM quotes WHERE public_id = 'test-pozitive';

INSERT INTO quote_payment_terms (quote_id, sort_order, term)
SELECT id, 1, 'תשלום בתוך 30 יום' FROM quotes WHERE public_id = 'test-elite';
