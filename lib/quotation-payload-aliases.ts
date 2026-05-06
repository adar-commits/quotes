/**
 * POST /api/quotes accepts heterogeneous CRM payloads. Clients often use
 * `invoiceId` / `agent_desc` while our types used `invoiceID` / `agentDesc` only —
 * reading `q.invoiceID` yields undefined and breaks upsert + agent_desc persistence.
 */

import { firstNonEmptyString } from "@/lib/quotation-customer-extract";

const UUID_HEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Canonical form for UUID-shaped invoice ids so lookups match across hex casing. */
export function normalizeUuidLikeInvoiceId(id: string): string {
  const t = id.trim();
  if (UUID_HEX.test(t)) return t.toLowerCase();
  return t;
}

/** Distinct values to try when matching `quotes.invoice_id` (handles legacy mixed-case rows). */
export function invoiceIdLookupVariants(raw: Record<string, unknown>): string[] {
  const rawStr =
    firstNonEmptyString(
      raw.invoiceID,
      raw.invoiceId,
      raw.InvoiceID,
      raw.invoice_id,
      raw.InvoiceId,
      raw.INVOICE_ID
    ) ?? "";
  const t = rawStr.trim();
  if (!t) return [];
  const canonical = normalizeUuidLikeInvoiceId(t);
  return canonical === t ? [t] : [canonical, t];
}

/** Value stored on `quotes.invoice_id` — canonicalized when UUID-shaped. */
export function invoiceIdForStorage(raw: Record<string, unknown>): string | null {
  const variants = invoiceIdLookupVariants(raw);
  const v = variants[0];
  return v ? normalizeUuidLikeInvoiceId(v) : null;
}

export function quotationIdForLookup(raw: Record<string, unknown>): string {
  return (
    firstNonEmptyString(
      raw.quotationID,
      raw.quotationId,
      raw.QuotationID,
      raw.quotation_id,
      raw.QuotationId
    ) ?? ""
  ).trim();
}

export function agentDescForDb(raw: Record<string, unknown>): string | null {
  return (
    firstNonEmptyString(
      raw.agentDesc,
      raw.agent_desc,
      raw.AgentDesc,
      raw.agent_description
    ) ?? null
  );
}

/** לכבוד / attention — separate from agent (sales rep) when both are sent. */
export function honorificLineForDb(raw: Record<string, unknown>): string | null {
  const hebrewKey = raw["לכבוד"] as unknown;
  return (
    firstNonEmptyString(
      raw.honorificLine,
      raw.honorific_line,
      raw.honorific,
      raw.attentionLine,
      raw.attention_line,
      raw.attention,
      raw.toWhom,
      raw.to_whom,
      raw.billingAttention,
      raw.billing_attention,
      hebrewKey
    ) ?? null
  );
}

export function projectNameForDb(raw: Record<string, unknown>): string | null {
  return (
    firstNonEmptyString(
      raw.projectName,
      raw.project_name,
      raw.ProjectName
    ) ?? null
  );
}

export function agentCodeForDb(raw: Record<string, unknown>): string | null {
  return (
    firstNonEmptyString(raw.agentCode, raw.agent_code, raw.AgentCode) ?? null
  );
}

export function invoiceCreationDateString(raw: Record<string, unknown>): string {
  return (
    firstNonEmptyString(
      raw.invoiceCreationDate,
      raw.invoice_creation_date,
      raw.InvoiceCreationDate,
      raw.invoiceDate,
      raw.invoice_date
    ) ?? ""
  );
}

export function productsArray(raw: Record<string, unknown>): unknown[] {
  const p = raw.products ?? raw.Products ?? raw.productLines;
  return Array.isArray(p) ? p : [];
}

export function paymentsTermsArray(raw: Record<string, unknown>): unknown[] {
  const p =
    raw.paymentsTerms ??
    raw.paymentTerms ??
    raw.payments_terms ??
    raw.payment_terms ??
    raw.PaymentsTerms;
  return Array.isArray(p) ? p : [];
}

export function specialDiscountNumber(raw: Record<string, unknown>): number {
  const v =
    raw.specialDiscount ?? raw.special_discount ?? raw.SpecialDiscount;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

export function requireSignatureBool(raw: Record<string, unknown>): boolean {
  const v =
    raw.requireSignature ?? raw.require_signature ?? raw.RequireSignature;
  if (typeof v === "boolean") return v;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return true;
}

export function vatNumber(raw: Record<string, unknown>): number | undefined {
  const v = raw.vat ?? raw.VAT ?? raw.Vat ?? raw.value_added_tax;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}
