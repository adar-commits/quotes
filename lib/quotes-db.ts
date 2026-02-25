import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type QuoteRow = {
  id: string;
  public_id: string;
  vat: number;
  invoice_id: string | null;
  project_name: string | null;
  quotation_id: string | null;
  special_discount: number;
  require_signature: boolean;
  invoice_creation_date: string | null;
  agent_code: string | null;
  agent_desc: string | null;
};

export type QuoteCustomerRow = {
  customer_id: string | null;
  customer_name: string | null;
  customer_address: string | null;
  customer_logo: string | null;
};

export type QuoteRepresentativeRow = {
  rep_phone: string | null;
  rep_avatar: string | null;
  rep_full_name: string | null;
};

export type QuoteProductRow = {
  sort_order: number;
  qty: number;
  sku: string | null;
  color: string | null;
  shape: string | null;
  material: string | null;
  technique: string | null;
  unit_price: number;
  unit_discount: number;
  picture_url: string | null;
  product_desc: string | null;
  additional_desc: string | null;
  approval_status: string | null;
};

export type QuotePaymentTermRow = {
  sort_order: number;
  term: string;
};

export type QuoteWithDetails = {
  quote: QuoteRow;
  customer: QuoteCustomerRow | null;
  representative: QuoteRepresentativeRow | null;
  products: QuoteProductRow[];
  paymentTerms: QuotePaymentTermRow[];
};

export async function getQuoteByPublicId(
  publicId: string
): Promise<QuoteWithDetails | null> {
  const supabase = createClient(url, anonKey);

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("public_id", publicId)
    .single();

  if (quoteError || !quote) return null;

  const [customerRes, repRes, productsRes, termsRes] = await Promise.all([
    supabase
      .from("quote_customers")
      .select("customer_id, customer_name, customer_address, customer_logo")
      .eq("quote_id", quote.id)
      .maybeSingle(),
    supabase
      .from("quote_representatives")
      .select("rep_phone, rep_avatar, rep_full_name")
      .eq("quote_id", quote.id)
      .maybeSingle(),
    supabase
      .from("quote_products")
      .select("*")
      .eq("quote_id", quote.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("quote_payment_terms")
      .select("sort_order, term")
      .eq("quote_id", quote.id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    quote: quote as QuoteRow,
    customer: customerRes.data as QuoteCustomerRow | null,
    representative: repRes.data as QuoteRepresentativeRow | null,
    products: (productsRes.data ?? []) as QuoteProductRow[],
    paymentTerms: (termsRes.data ?? []) as QuotePaymentTermRow[],
  };
}
