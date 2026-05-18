const DEFAULT_QUOTE_WEBHOOK_URL =
  "https://hook.eu2.make.com/4i0gxbxw40zefjsvvdhdl15tb0cm33me";

/**
 * Webhook for quote events (signature notification, payment link generation).
 * Override with `QUOTE_WEBHOOK_URL` in production if the scenario URL changes.
 */
export function getQuoteWebhookUrl(): string {
  const env = process.env.QUOTE_WEBHOOK_URL?.trim();
  if (env) return env;
  return DEFAULT_QUOTE_WEBHOOK_URL;
}
