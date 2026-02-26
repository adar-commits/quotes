import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

const WEBHOOK_URL =
  "https://redcarpet.app.n8n.cloud/webhook-test/dbb8db92-f1f1-4f8a-8f02-6d88d3865df2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("public_id", publicId)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

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

  const customer = customerRes.data ?? null;
  const representative = repRes.data ?? null;
  const products = productsRes.data ?? [];
  const paymentTerms = termsRes.data ?? [];

  await supabase
    .from("quotes")
    .update({ status: "signed" })
    .eq("id", quote.id);

  const payload = {
    status: "Signed",
    quote: { ...quote, status: "signed" },
    customer,
    representative,
    products,
    paymentTerms,
  };

  try {
    const webhookRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!webhookRes.ok) {
      console.error("Webhook failed", webhookRes.status, await webhookRes.text());
    }
  } catch (e) {
    console.error("Webhook request failed", e);
  }

  return NextResponse.json({ ok: true, status: "Signed" });
}
