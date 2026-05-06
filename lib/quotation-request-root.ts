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

/**
 * Partial wrapper objects often include `customer: null` or omit `invoiceID`.
 * Blind spreads would wipe a good nested `customer` and break persistence + upsert.
 */
const MERGE_PROTECTED_FROM_NULL = new Set([
  "customer",
  "Customer",
  "client",
  "Client",
  "products",
  "Products",
  "Representative",
  "representative",
  "paymentsTerms",
  "paymentTerms",
  "payments_terms",
  "payment_terms",
  "PaymentsTerms",
  "invoiceID",
  "invoiceId",
  "InvoiceID",
  "invoice_id",
  "InvoiceId",
  "INVOICE_ID",
  "quotationID",
  "quotationId",
  "QuotationID",
  "quotation_id",
  "QuotationId",
  "agentDesc",
  "agent_desc",
  "AgentDesc",
  "honorificLine",
  "honorific_line",
  "honorific",
  "לכבוד",
]);

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, "");
}

export function mergeQuoteLayerPatch(
  base: Record<string, unknown>,
  patch: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (v === null && MERGE_PROTECTED_FROM_NULL.has(k)) {
      const cur = out[k];
      if (cur !== undefined && cur !== null) continue;
    }
    out[k] = v;
  }
  return out;
}

function flattenOnce(o: Record<string, unknown>): Record<string, unknown> {
  let out = { ...o };
  for (const key of WRAPPER_KEYS) {
    const v = o[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out = mergeQuoteLayerPatch(out, v as Record<string, unknown>);
    }
    if (typeof v === "string") {
      const t = stripBom(v.trim());
      if (t.startsWith("{") || t.startsWith("[")) {
        try {
          const parsed: unknown = JSON.parse(t);
          const inner = Array.isArray(parsed) ? parsed[0] : parsed;
          if (inner && typeof inner === "object" && !Array.isArray(inner)) {
            out = mergeQuoteLayerPatch(out, inner as Record<string, unknown>);
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
    return mergeQuoteLayerPatch(wrapperRest, inner as Record<string, unknown>);
  } catch {
    return input;
  }
}

function firstNonEmptyInvoiceIdString(
  ...candidates: unknown[]
): string | null {
  for (const v of candidates) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return null;
}

/** If invoice id only exists under `order`, `metadata`, etc., lift it for upsert aliases. */
function liftInvoiceIdOntoRoot(root: Record<string, unknown>): Record<string, unknown> {
  if (firstNonEmptyInvoiceIdString(
    root.invoiceID,
    root.invoiceId,
    root.InvoiceID,
    root.invoice_id,
    root.InvoiceId,
    root.INVOICE_ID
  )) {
    return root;
  }
  const nests = [
    root.order,
    root.Order,
    root.metadata,
    root.MetaData,
    root.record,
    root.Record,
  ];
  for (const n of nests) {
    if (!n || typeof n !== "object" || Array.isArray(n)) continue;
    const o = n as Record<string, unknown>;
    const id = firstNonEmptyInvoiceIdString(
      o.invoiceID,
      o.invoiceId,
      o.InvoiceID,
      o.invoice_id,
      o.InvoiceId,
      o.INVOICE_ID
    );
    if (id) return { ...root, invoiceID: id };
  }
  return root;
}

/** Legacy string `json` + flatten nested wrappers (repeat-safe). */
export function normalizeQuoteRequestRoot(peeledObject: Record<string, unknown>): Record<string, unknown> {
  let root = mergeLegacyJsonStringProperty(peeledObject);
  root = flattenQuoteWrapperLayers(root);
  root = liftInvoiceIdOntoRoot(root);
  return root;
}
