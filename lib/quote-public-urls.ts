/** Query string for the client-tracked public quote URL (webhook quoteWatched). */
export const QUOTE_CLIENT_VIEWER_PARAM = "viewer=client";

export function buildQuotePublicUrl(baseUrl: string, publicId: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/${publicId}`;
}

export function buildQuoteClientTrackedUrl(
  baseUrl: string,
  publicId: string
): string {
  return `${buildQuotePublicUrl(baseUrl, publicId)}?${QUOTE_CLIENT_VIEWER_PARAM}`;
}
