ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS client_view_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN quotes.client_view_count IS 'Number of times the client tracking URL (?viewer=client) was opened; incremented atomically per hit.';

CREATE OR REPLACE FUNCTION public.increment_quote_client_view_count(p_public_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.quotes
  SET client_view_count = client_view_count + 1
  WHERE public_id = p_public_id
  RETURNING client_view_count INTO v_count;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_quote_client_view_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_quote_client_view_count(text) TO service_role;
