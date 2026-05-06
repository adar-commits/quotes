/**
 * Maps quotation POST body fields (nested `customer` + root) into DB columns.
 * Accepts common variants: camelCase, snake_case, PascalCase, string `customer`, etc.
 */

/**
 * Some CRMs send `customer` as a stringified JSON object instead of a nested object.
 * Normalize so merge/extraction see real keys (`customerName`, etc.).
 */
export function normalizeCustomerPayload(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const c = raw.customer;
  if (typeof c !== "string") return raw;
  const t = c.trim();
  if (!t.startsWith("{")) return raw;
  try {
    const parsed: unknown = JSON.parse(t);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return raw;
    return { ...raw, customer: parsed as Record<string, unknown> };
  } catch {
    return raw;
  }
}

/** Merge nested customer-like objects (`customer`, `Customer`, `client`, …). Later sources override earlier. */
export function mergeCustomerNestedObjects(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const keys = ["customer", "Customer", "client", "Client"] as const;
  let merged: Record<string, unknown> = {};
  for (const k of keys) {
    const c = raw[k];
    if (Array.isArray(c) && c[0] && typeof c[0] === "object" && !Array.isArray(c[0])) {
      merged = { ...merged, ...(c[0] as Record<string, unknown>) };
    } else if (c && typeof c === "object" && !Array.isArray(c)) {
      merged = { ...merged, ...(c as Record<string, unknown>) };
    }
  }
  return merged;
}

export function firstNonEmptyString(...candidates: unknown[]): string | null {
  for (const v of candidates) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return null;
}

export function extractQuotationCustomerFields(raw: Record<string, unknown>): {
  customer_id: string | null;
  customer_name: string | null;
  customer_address: string | null;
} {
  const rawNorm = normalizeCustomerPayload(raw);
  const nested = mergeCustomerNestedObjects(rawNorm);

  const customerFromRootString =
    typeof rawNorm.customer === "string"
      ? firstNonEmptyString(rawNorm.customer)
      : null;

  const customer_id = firstNonEmptyString(
    nested.customerID,
    nested.customer_id,
    nested.CustomerID,
    rawNorm.customerID,
    rawNorm.customer_id,
    rawNorm.CustomerID
  );

  const customer_name = firstNonEmptyString(
    nested.customerName,
    nested.customer_name,
    nested.CustomerName,
    nested.Name,
    nested.name,
    nested.clientName,
    nested.client_name,
    nested.ClientName,
    nested.companyName,
    nested.CompanyName,
    rawNorm.customerName,
    rawNorm.customer_name,
    rawNorm.CustomerName,
    rawNorm.clientName,
    rawNorm.client_name,
    rawNorm.ClientName,
    rawNorm.companyName,
    rawNorm.CompanyName,
    customerFromRootString
  );

  const addressCandidate =
    nested.customerAddress ??
    nested.customer_address ??
    nested.CustomerAddress ??
    rawNorm.customerAddress ??
    rawNorm.customer_address ??
    rawNorm.CustomerAddress;

  const customer_address =
    addressCandidate === undefined || addressCandidate === null
      ? null
      : String(addressCandidate);

  return {
    customer_id,
    customer_name,
    customer_address,
  };
}
