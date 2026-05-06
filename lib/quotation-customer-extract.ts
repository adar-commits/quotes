/**
 * Maps quotation POST body fields (nested `customer` + root) into DB columns.
 * Accepts common variants: camelCase, snake_case, PascalCase, string `customer`, etc.
 */

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
  const nested = mergeCustomerNestedObjects(raw);

  const customerFromRootString =
    typeof raw.customer === "string"
      ? firstNonEmptyString(raw.customer)
      : null;

  const customer_id = firstNonEmptyString(
    nested.customerID,
    nested.customer_id,
    nested.CustomerID,
    raw.customerID,
    raw.customer_id,
    raw.CustomerID
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
    raw.customerName,
    raw.customer_name,
    raw.CustomerName,
    raw.clientName,
    raw.client_name,
    raw.ClientName,
    raw.companyName,
    raw.CompanyName,
    customerFromRootString
  );

  const addressCandidate =
    nested.customerAddress ??
    nested.customer_address ??
    nested.CustomerAddress ??
    raw.customerAddress ??
    raw.customer_address ??
    raw.CustomerAddress;

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
