-- Quote templates (redcarpet, pozitive, elite_rugs) for theming

CREATE TABLE quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_key text NOT NULL UNIQUE,
  main_color text NOT NULL DEFAULT '#801a1e',
  bullets_color text,
  banner_url text,
  background_url text,
  favicon_url text,
  logo_url text,
  contact_strip_bg text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER quote_templates_updated_at
  BEFORE UPDATE ON quote_templates
  FOR EACH ROW EXECUTE FUNCTION set_quote_updated_at();

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES quote_templates(id) ON DELETE SET NULL;

INSERT INTO quote_templates (name, template_key, main_color, bullets_color, banner_url, background_url, logo_url, contact_strip_bg)
VALUES
  ('Red Carpet', 'redcarpet', '#801a1e', '#801a1e', 'https://quotes.carpetshop.co.il/img/invoice_header.jpg', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1920', 'https://quotes.carpetshop.co.il/img/invoice_header.jpg', '#801a1e'),
  ('Pozitive', 'pozitive', '#2563eb', '#2563eb', NULL, NULL, NULL, '#2563eb'),
  ('Elite Rugs', 'elite_rugs', '#059669', '#059669', NULL, NULL, NULL, '#059669')
ON CONFLICT (template_key) DO NOTHING;

CREATE INDEX idx_quotes_template_id ON quotes(template_id);

-- RLS
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read quote_templates"
  ON quote_templates FOR SELECT USING (true);
CREATE POLICY "Service role can do all on quote_templates"
  ON quote_templates FOR ALL USING (auth.role() = 'service_role');
