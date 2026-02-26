-- One example quote per template for testing (VAT 18%). Fill all possible fields.
-- View at: /test-redcarpet, /test-pozitive, /test-elite

-- Delete existing test quotes so we can re-seed with full data (optional: comment out if you want to keep existing)
-- DELETE FROM quote_payment_terms WHERE quote_id IN (SELECT id FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite'));
-- DELETE FROM quote_products WHERE quote_id IN (SELECT id FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite'));
-- DELETE FROM quote_representatives WHERE quote_id IN (SELECT id FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite'));
-- DELETE FROM quote_customers WHERE quote_id IN (SELECT id FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite'));
-- DELETE FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite');

INSERT INTO quotes (public_id, vat, invoice_id, project_name, quotation_id, special_discount, require_signature, invoice_creation_date, agent_code, agent_desc, template_id)
SELECT 'test-redcarpet', 18, 'INV-2026-001', 'דוגמה Red Carpet', 'QT-RC-001', 50, true, now() - interval '2 days', 'AG001', 'סוכן מכירות', id FROM quote_templates WHERE template_key = 'redcarpet' LIMIT 1
ON CONFLICT (public_id) DO UPDATE SET vat = 18, invoice_id = EXCLUDED.invoice_id, project_name = EXCLUDED.project_name, quotation_id = EXCLUDED.quotation_id, special_discount = EXCLUDED.special_discount, require_signature = EXCLUDED.require_signature, invoice_creation_date = EXCLUDED.invoice_creation_date, agent_code = EXCLUDED.agent_code, agent_desc = EXCLUDED.agent_desc, template_id = EXCLUDED.template_id;

INSERT INTO quotes (public_id, vat, invoice_id, project_name, quotation_id, special_discount, require_signature, invoice_creation_date, agent_code, agent_desc, template_id)
SELECT 'test-pozitive', 18, 'INV-2026-002', 'דוגמה Pozitive', 'QT-PZ-002', 25, true, now() - interval '1 day', 'AG002', 'נציג שירות', id FROM quote_templates WHERE template_key = 'pozitive' LIMIT 1
ON CONFLICT (public_id) DO UPDATE SET vat = 18, invoice_id = EXCLUDED.invoice_id, project_name = EXCLUDED.project_name, quotation_id = EXCLUDED.quotation_id, special_discount = EXCLUDED.special_discount, require_signature = EXCLUDED.require_signature, invoice_creation_date = EXCLUDED.invoice_creation_date, agent_code = EXCLUDED.agent_code, agent_desc = EXCLUDED.agent_desc, template_id = EXCLUDED.template_id;

INSERT INTO quotes (public_id, vat, invoice_id, project_name, quotation_id, special_discount, require_signature, invoice_creation_date, agent_code, agent_desc, template_id)
SELECT 'test-elite', 18, 'INV-2026-003', 'דוגמה Elite Rugs', 'QT-ER-003', 0, true, now(), 'AG003', 'יועץ פרימיום', id FROM quote_templates WHERE template_key = 'elite_rugs' LIMIT 1
ON CONFLICT (public_id) DO UPDATE SET vat = 18, invoice_id = EXCLUDED.invoice_id, project_name = EXCLUDED.project_name, quotation_id = EXCLUDED.quotation_id, special_discount = EXCLUDED.special_discount, require_signature = EXCLUDED.require_signature, invoice_creation_date = EXCLUDED.invoice_creation_date, agent_code = EXCLUDED.agent_code, agent_desc = EXCLUDED.agent_desc, template_id = EXCLUDED.template_id;

-- quote_customers (all fields)
INSERT INTO quote_customers (quote_id, customer_id, customer_name, customer_address)
SELECT id, 'CUST-RC-001', 'לקוח לדוגמה Red Carpet', 'רחוב הדוגמה 1, תל אביב 12345' FROM quotes WHERE public_id = 'test-redcarpet'
ON CONFLICT (quote_id) DO UPDATE SET customer_id = EXCLUDED.customer_id, customer_name = EXCLUDED.customer_name, customer_address = EXCLUDED.customer_address;

INSERT INTO quote_customers (quote_id, customer_id, customer_name, customer_address)
SELECT id, 'CUST-PZ-002', 'לקוח לדוגמה Pozitive', 'שדרות השלום 20, חיפה' FROM quotes WHERE public_id = 'test-pozitive'
ON CONFLICT (quote_id) DO UPDATE SET customer_id = EXCLUDED.customer_id, customer_name = EXCLUDED.customer_name, customer_address = EXCLUDED.customer_address;

INSERT INTO quote_customers (quote_id, customer_id, customer_name, customer_address)
SELECT id, 'CUST-ER-003', 'לקוח לדוגמה Elite Rugs', 'דרך מנחם בגין 100, תל אביב' FROM quotes WHERE public_id = 'test-elite'
ON CONFLICT (quote_id) DO UPDATE SET customer_id = EXCLUDED.customer_id, customer_name = EXCLUDED.customer_name, customer_address = EXCLUDED.customer_address;

-- quote_representatives (all fields)
INSERT INTO quote_representatives (quote_id, rep_phone, rep_avatar, rep_full_name)
SELECT id, '03-1234567', 'https://api.dicebear.com/7.x/avataaars/png?size=128&seed=rc', 'מפיק ההצעה Red Carpet' FROM quotes WHERE public_id = 'test-redcarpet'
ON CONFLICT (quote_id) DO UPDATE SET rep_phone = EXCLUDED.rep_phone, rep_avatar = EXCLUDED.rep_avatar, rep_full_name = EXCLUDED.rep_full_name;

INSERT INTO quote_representatives (quote_id, rep_phone, rep_avatar, rep_full_name)
SELECT id, '04-9876543', 'https://api.dicebear.com/7.x/avataaars/png?size=128&seed=pz', 'מפיק ההצעה Pozitive' FROM quotes WHERE public_id = 'test-pozitive'
ON CONFLICT (quote_id) DO UPDATE SET rep_phone = EXCLUDED.rep_phone, rep_avatar = EXCLUDED.rep_avatar, rep_full_name = EXCLUDED.rep_full_name;

INSERT INTO quote_representatives (quote_id, rep_phone, rep_avatar, rep_full_name)
SELECT id, '052-1112233', 'https://api.dicebear.com/7.x/avataaars/png?size=128&seed=er', 'מפיק ההצעה Elite Rugs' FROM quotes WHERE public_id = 'test-elite'
ON CONFLICT (quote_id) DO UPDATE SET rep_phone = EXCLUDED.rep_phone, rep_avatar = EXCLUDED.rep_avatar, rep_full_name = EXCLUDED.rep_full_name;

-- quote_products: delete existing then insert full rows (two products per quote)
DELETE FROM quote_products WHERE quote_id IN (SELECT id FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite'));

INSERT INTO quote_products (quote_id, sort_order, qty, sku, color, shape, material, technique, unit_price, unit_discount, picture_url, product_desc, additional_desc)
SELECT id, 1, 2, 'SKU-001', 'אדום', 'מלבני', 'צמר', 'ידני', 500.0000, 25.0000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 'שטיח קלאסי לדוגמה', 'תיאור נוסף למוצר ראשון' FROM quotes WHERE public_id = 'test-redcarpet';
INSERT INTO quote_products (quote_id, sort_order, qty, sku, color, shape, material, technique, unit_price, unit_discount, picture_url, product_desc, additional_desc)
SELECT id, 2, 1, 'SKU-002', 'כחול', 'עגול', 'סינתטי', 'מכונה', 1200.5000, 0, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 'שטיח פרימיום', NULL FROM quotes WHERE public_id = 'test-redcarpet';

INSERT INTO quote_products (quote_id, sort_order, qty, sku, color, shape, material, technique, unit_price, unit_discount, picture_url, product_desc, additional_desc)
SELECT id, 1, 2, 'SKU-001', 'אדום', 'מלבני', 'צמר', 'ידני', 500.0000, 25.0000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 'מוצר לדוגמה Pozitive', 'תיאור נוסף' FROM quotes WHERE public_id = 'test-pozitive';
INSERT INTO quote_products (quote_id, sort_order, qty, sku, color, shape, material, technique, unit_price, unit_discount, picture_url, product_desc, additional_desc)
SELECT id, 2, 1, 'SKU-002', 'כחול', 'עגול', 'סינתטי', 'מכונה', 1200.5000, 0, NULL, 'שטיח פרימיום', NULL FROM quotes WHERE public_id = 'test-pozitive';

INSERT INTO quote_products (quote_id, sort_order, qty, sku, color, shape, material, technique, unit_price, unit_discount, picture_url, product_desc, additional_desc)
SELECT id, 1, 2, 'SKU-001', 'אדום', 'מלבני', 'צמר', 'ידני', 500.0000, 25.0000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 'מוצר לדוגמה Elite', 'תיאור נוסף' FROM quotes WHERE public_id = 'test-elite';
INSERT INTO quote_products (quote_id, sort_order, qty, sku, color, shape, material, technique, unit_price, unit_discount, picture_url, product_desc, additional_desc)
SELECT id, 2, 1, 'SKU-002', 'כחול', 'עגול', 'סינתטי', 'מכונה', 1200.5000, 0, NULL, 'שטיח פרימיום', NULL FROM quotes WHERE public_id = 'test-elite';

-- quote_payment_terms: delete existing then insert (two terms per quote)
DELETE FROM quote_payment_terms WHERE quote_id IN (SELECT id FROM quotes WHERE public_id IN ('test-redcarpet','test-pozitive','test-elite'));

INSERT INTO quote_payment_terms (quote_id, sort_order, term) SELECT id, 1, 'תשלום בתוך 30 יום מתאריך החשבון' FROM quotes WHERE public_id = 'test-redcarpet';
INSERT INTO quote_payment_terms (quote_id, sort_order, term) SELECT id, 2, 'המחאה או העברה בנקאית' FROM quotes WHERE public_id = 'test-redcarpet';

INSERT INTO quote_payment_terms (quote_id, sort_order, term) SELECT id, 1, 'תשלום בתוך 30 יום מתאריך החשבון' FROM quotes WHERE public_id = 'test-pozitive';
INSERT INTO quote_payment_terms (quote_id, sort_order, term) SELECT id, 2, 'המחאה או העברה בנקאית' FROM quotes WHERE public_id = 'test-pozitive';

INSERT INTO quote_payment_terms (quote_id, sort_order, term) SELECT id, 1, 'תשלום בתוך 30 יום מתאריך החשבון' FROM quotes WHERE public_id = 'test-elite';
INSERT INTO quote_payment_terms (quote_id, sort_order, term) SELECT id, 2, 'המחאה או העברה בנקאית' FROM quotes WHERE public_id = 'test-elite';
