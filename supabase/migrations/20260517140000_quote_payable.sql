ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS payable boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN quotes.payable IS 'When true (from POST /api/quotes JSON), signed quotes may request a credit-card payment link via webhook.';
