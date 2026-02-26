-- quote status for draft / signed

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

COMMENT ON COLUMN quotes.status IS 'draft | signed';
