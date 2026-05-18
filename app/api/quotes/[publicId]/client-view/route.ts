import { NextRequest, NextResponse } from "next/server";
import { parseClientSignaturePayload } from "@/lib/client-signature";
import { loadQuoteWebhookEnrichment } from "@/lib/quote-webhook-enrichment";
import { getQuoteWebhookUrl } from "@/lib/quote-webhook";
import { createServiceRoleClient } from "@/lib/supabase-server";

/**
 * Records a client open of `/{publicId}?viewer=client`, increments DB counter,
 * and POSTs to the quote webhook with eventType quoteWatched.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "increment_quote_client_view_count",
    { p_public_id: publicId }
  );

  if (rpcError) {
    console.error("increment_quote_client_view_count:", rpcError);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }

  const newCount =
    typeof rpcData === "number"
      ? rpcData
      : typeof rpcData === "string"
        ? Number(rpcData)
        : NaN;

  if (!Number.isFinite(newCount) || newCount < 1) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

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
    signature_payload?: unknown;
    representative_snapshot?: unknown;
  };

  const { customer, representative, products, paymentTerms } =
    await loadQuoteWebhookEnrichment(supabase, quote.id, row);

  const signature =
    parseClientSignaturePayload(row.signature_payload) ?? {};

  const isSigned = row.status === "signed";
  const payload = {
    eventType: "quoteWatched" as const,
    watchCount: newCount,
    isSigned,
    status: isSigned ? "Signed" : "Draft",
    quote,
    customer,
    representative,
    products,
    paymentTerms,
    signature,
  };

  try {
    const webhookRes = await fetch(getQuoteWebhookUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!webhookRes.ok) {
      console.error(
        "quoteWatched webhook failed",
        webhookRes.status,
        await webhookRes.text()
      );
    }
  } catch (e) {
    console.error("quoteWatched webhook request failed", e);
  }

  return NextResponse.json({ ok: true, watchCount: newCount });
}
