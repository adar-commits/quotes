import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  mergeRepresentativeRowWithSnapshot,
  normalizeRepresentativeSnapshot,
} from "@/lib/quotation-representative-extract";

const WEBHOOK_URL =
  "https://hook.eu2.make.com/4i0gxbxw40zefjsvvdhdl15tb0cm33me";

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

  let signature: {
    signerName?: string;
    companyName?: string;
    companyReg?: string;
  } = {};
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const b = body as Record<string, unknown>;
      signature = {
        signerName:
          typeof b.signerName === "string" ? b.signerName : undefined,
        companyName:
          typeof b.companyName === "string" ? b.companyName : undefined,
        companyReg:
          typeof b.companyReg === "string" ? b.companyReg : undefined,
      };
    }
  } catch {
    /* optional or invalid JSON body */
  }

  const [customerRes, repRes, productsRes, termsRes] = await Promise.all([
    supabase
      .from("quote_customers")
      .select("customer_id, customer_name, customer_address, customer_logo")
      .eq("quote_id", quote.id)
      .maybeSingle(),
    supabase
      .from("quote_representatives")
      .select("rep_phone, rep_email, rep_avatar, rep_full_name, rep_title")
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

  const qRow = quote as { representative_snapshot?: unknown };
  const repSnapshot = normalizeRepresentativeSnapshot(
    qRow.representative_snapshot
  );
  const representative = mergeRepresentativeRowWithSnapshot(
    repRes.data,
    repSnapshot
  );
  const products = productsRes.data ?? [];
  const paymentTerms = termsRes.data ?? [];

  await supabase
    .from("quotes")
    .update({ status: "signed" })
    .eq("id", quote.id);

  const payload = {
    isSigned: true,
    status: "Signed",
    quote: { ...quote, status: "signed" },
    customer,
    representative,
    products,
    paymentTerms,
    signature,
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
