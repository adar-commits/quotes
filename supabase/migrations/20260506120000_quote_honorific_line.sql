-- לכבוד / attention line (separate from agent_desc when CRM sends both)

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS honorific_line text;

COMMENT ON COLUMN quotes.honorific_line IS 'לכבוד line from POST (honorificLine, attention, לכבוד, …); public page falls back to agent_desc if empty.';
