import { NextRequest, NextResponse } from "next/server";
import { parseClientSignaturePayload } from "@/lib/client-signature";
import { loadQuoteWebhookEnrichment } from "@/lib/quote-webhook-enrichment";
import { getQuoteWebhookUrl } from "@/lib/quote-webhook";
import { createServiceRoleClient } from "@/lib/supabase-server";

function isHttpOrHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(
  _request: NextRequest,
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

  const row = quote as {
    status?: string | null;
    payable?: boolean;
    signature_payload?: unknown;
    representative_snapshot?: unknown;
  };

  if (row.status !== "signed") {
    return NextResponse.json(
      { error: "Quote must be signed before requesting a payment link" },
      { status: 409 }
    );
  }

  if (row.payable !== true) {
    return NextResponse.json(
      { error: "Payment link is not enabled for this quote" },
      { status: 403 }
    );
  }

  const { customer, representative, products, paymentTerms } =
    await loadQuoteWebhookEnrichment(supabase, quote.id, row);

  const signature =
    parseClientSignaturePayload(row.signature_payload) ?? {};

  const payload = {
    paymentLink: true,
    isSigned: true,
    status: "Signed",
    quote,
    customer,
    representative,
    products,
    paymentTerms,
    signature,
  };

  let webhookRes: Response;
  try {
    webhookRes = await fetch(getQuoteWebhookUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("payment-link webhook fetch failed", e);
    return NextResponse.json(
      { error: "Payment link service unavailable" },
      { status: 502 }
    );
  }

  const text = await webhookRes.text();

  if (!webhookRes.ok) {
    console.error("payment-link webhook failed", webhookRes.status, text);
    return NextResponse.json(
      { error: "Failed to generate payment link" },
      { status: 502 }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    console.error("payment-link webhook returned non-JSON", text.slice(0, 500));
    return NextResponse.json(
      { error: "Invalid response from payment link service" },
      { status: 502 }
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(
      { error: "Invalid response from payment link service" },
      { status: 502 }
    );
  }

  const paymentLinkUrl = (parsed as Record<string, unknown>).paymentLinkUrl;
  if (typeof paymentLinkUrl !== "string" || !isHttpOrHttpsUrl(paymentLinkUrl)) {
    console.error("payment-link missing or bad paymentLinkUrl", parsed);
    return NextResponse.json(
      { error: "Invalid payment link URL from service" },
      { status: 502 }
    );
  }

  return NextResponse.json({ paymentLinkUrl: paymentLinkUrl.trim() });
}
