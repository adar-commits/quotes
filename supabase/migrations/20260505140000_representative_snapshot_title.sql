-- Persist last-ingested representative payload on quotes for reliable public-page display.
-- Optional job title on quote_representatives.

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS representative_snapshot jsonb;

COMMENT ON COLUMN quotes.representative_snapshot IS 'Normalized representative object from last POST /api/quotes (fallback + merge with quote_representatives).';

ALTER TABLE quote_representatives
  ADD COLUMN IF NOT EXISTS rep_title text;

COMMENT ON COLUMN quote_representatives.rep_title IS 'Title / role from JSON repTitle, title, jobTitle, etc.';
