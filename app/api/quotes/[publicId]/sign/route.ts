import { NextRequest, NextResponse } from "next/server";
import type { ClientSignaturePayload } from "@/lib/client-signature";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  mergeRepresentativeRowWithSnapshot,
  normalizeRepresentativeSnapshot,
} from "@/lib/quotation-representative-extract";

const PNG_DATA_URL_PREFIX = "data:image/png;base64,";
/** Reject empty / near-empty canvas uploads (~trivial PNG). */
const MIN_SIGNATURE_BASE64_LEN = 800;
const MAX_SIGNATURE_DATA_URL_LEN = 2_500_000;

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

  const qStatus = (quote as { status?: string | null }).status;
  if (qStatus === "signed") {
    return NextResponse.json(
      { error: "Quote already signed" },
      { status: 409 }
    );
  }

  let signatureImage: string | undefined;
  let signature: ClientSignaturePayload = {};
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const b = body as Record<string, unknown>;
      signature = {
        signerName:
          typeof b.signerName === "string" ? b.signerName.trim() : undefined,
        companyName:
          typeof b.companyName === "string" ? b.companyName.trim() : undefined,
        companyReg:
          typeof b.companyReg === "string" ? b.companyReg.trim() : undefined,
      };
      if (typeof b.signatureImage === "string") {
        signatureImage = b.signatureImage;
      }
    }
  } catch {
    /* optional or invalid JSON body */
  }

  if (!signature.signerName) {
    return NextResponse.json(
      { error: "signerName is required" },
      { status: 400 }
    );
  }

  if (
    typeof signatureImage !== "string" ||
    !signatureImage.startsWith(PNG_DATA_URL_PREFIX)
  ) {
    return NextResponse.json(
      { error: "signatureImage must be a PNG data URL (data:image/png;base64,...)" },
      { status: 400 }
    );
  }

  if (signatureImage.length > MAX_SIGNATURE_DATA_URL_LEN) {
    return NextResponse.json(
      { error: "Signature image is too large" },
      { status: 400 }
    );
  }

  const b64Part = signatureImage.slice(PNG_DATA_URL_PREFIX.length);
  if (b64Part.length < MIN_SIGNATURE_BASE64_LEN) {
    return NextResponse.json(
      { error: "Signature drawing is missing or too small" },
      { status: 400 }
    );
  }

  const signaturePayload: ClientSignaturePayload = {
    ...signature,
    imagePngDataUrl: signatureImage,
  };

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

  const signedAt = new Date().toISOString();
  const { error: signUpdateError } = await supabase
    .from("quotes")
    .update({
      status: "signed",
      signed_at: signedAt,
      signature_payload: signaturePayload as unknown as Record<string, unknown>,
    })
    .eq("id", quote.id);

  if (signUpdateError) {
    console.error("quotes sign update:", signUpdateError);
    return NextResponse.json(
      { error: "Failed to save signature" },
      { status: 500 }
    );
  }

  const payload = {
    isSigned: true,
    status: "Signed",
    quote: { ...quote, status: "signed", signed_at: signedAt, signature_payload: signaturePayload },
    customer,
    representative,
    products,
    paymentTerms,
    signature: signaturePayload,
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
