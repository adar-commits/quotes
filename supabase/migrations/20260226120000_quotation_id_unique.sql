-- Unique index on quotation_id (OP-xxx) so we can upsert by it
CREATE UNIQUE INDEX idx_quotes_quotation_id_unique
  ON quotes(quotation_id)
  WHERE quotation_id IS NOT NULL AND quotation_id <> '';
