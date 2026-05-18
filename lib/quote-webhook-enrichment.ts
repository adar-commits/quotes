import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  mergeRepresentativeRowWithSnapshot,
  normalizeRepresentativeSnapshot,
  type RepresentativeSnapshot,
} from "@/lib/quotation-representative-extract";
import type {
  QuoteCustomerRow,
  QuotePaymentTermRow,
  QuoteProductRow,
} from "@/lib/quotes-db";

export type QuoteWebhookEnrichment = {
  customer: QuoteCustomerRow | null;
  representative: RepresentativeSnapshot;
  products: QuoteProductRow[];
  paymentTerms: QuotePaymentTermRow[];
};

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

/**
 * Loads customer, representative (merged with snapshot), products, and payment terms
 * for the same webhook envelope used by sign and payment-link.
 */
export async function loadQuoteWebhookEnrichment(
  supabase: ServiceClient,
  quoteId: string,
  quoteRow: { representative_snapshot?: unknown }
): Promise<QuoteWebhookEnrichment> {
  const [customerRes, repRes, productsRes, termsRes] = await Promise.all([
    supabase
      .from("quote_customers")
      .select("customer_id, customer_name, customer_address, customer_logo")
      .eq("quote_id", quoteId)
      .maybeSingle(),
    supabase
      .from("quote_representatives")
      .select("rep_phone, rep_email, rep_avatar, rep_full_name, rep_title")
      .eq("quote_id", quoteId)
      .maybeSingle(),
    supabase
      .from("quote_products")
      .select("*")
      .eq("quote_id", quoteId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("quote_payment_terms")
      .select("sort_order, term")
      .eq("quote_id", quoteId)
      .order("sort_order", { ascending: true }),
  ]);

  const customer = customerRes.data ?? null;
  const repSnapshot = normalizeRepresentativeSnapshot(
    quoteRow.representative_snapshot
  );
  const representative = mergeRepresentativeRowWithSnapshot(
    repRes.data,
    repSnapshot
  );

  return {
    customer: customer as QuoteCustomerRow | null,
    representative,
    products: (productsRes.data ?? []) as QuoteProductRow[],
    paymentTerms: (termsRes.data ?? []) as QuotePaymentTermRow[],
  };
}
