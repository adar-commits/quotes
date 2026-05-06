/**
 * External POST bodies rarely match `{ vat, invoiceID, customer, ... }` at the top level.
 * Shopify Flow, proxies, and CRM webhooks often wrap the quote in `payload`, `body`,
 * `json` (object or string), `data`, etc. Without merging those layers, `invoiceID` is
 * undefined, upsert never matches, and customer/agent fields never persist.
 */

const WRAPPER_KEYS = [
  "json",
  "body",
  "payload",
  "data",
  "quote",
  "input",
  "record",
  "attributes",
  "shopifyQuote",
] as const;

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, "");
}

function flattenOnce(o: Record<string, unknown>): Record<string, unknown> {
  let out = { ...o };
  for (const key of WRAPPER_KEYS) {
    const v = o[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out = { ...out, ...(v as Record<string, unknown>) };
    }
    if (typeof v === "string") {
      const t = stripBom(v.trim());
      if (t.startsWith("{") || t.startsWith("[")) {
        try {
          const parsed: unknown = JSON.parse(t);
          const inner = Array.isArray(parsed) ? parsed[0] : parsed;
          if (inner && typeof inner === "object" && !Array.isArray(inner)) {
            out = { ...out, ...(inner as Record<string, unknown>) };
          }
        } catch {
          /* ignore */
        }
      }
    }
  }
  return out;
}

/** Merge nested wrapper objects/strings onto one flat root (inner wins on duplicate keys). */
export function flattenQuoteWrapperLayers(input: Record<string, unknown>): Record<string, unknown> {
  let cur = { ...input };
  for (let i = 0; i < 8; i++) {
    cur = flattenOnce(cur);
  }
  return cur;
}

/**
 * Legacy: `{ "json": "{\"vat\":18,...}" }` as a single string.
 * Inner keys win over wrapper keys.
 */
export function mergeLegacyJsonStringProperty(
  input: Record<string, unknown>
): Record<string, unknown> {
  const jsonStr = input.json;
  if (typeof jsonStr !== "string") return input;
  const trimmed = stripBom(jsonStr.trim());
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return input;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed == null || typeof parsed !== "object") return input;
    const inner = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!inner || typeof inner !== "object" || Array.isArray(inner)) return input;
    const { json: _drop, ...wrapperRest } = input;
    return { ...wrapperRest, ...(inner as Record<string, unknown>) };
  } catch {
    return input;
  }
}

/** Legacy string `json` + flatten nested wrappers (repeat-safe). */
export function normalizeQuoteRequestRoot(peeledObject: Record<string, unknown>): Record<string, unknown> {
  let root = mergeLegacyJsonStringProperty(peeledObject);
  root = flattenQuoteWrapperLayers(root);
  return root;
}
