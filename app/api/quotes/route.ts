import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { calculateQuoteBreakdown } from "@/lib/quote-total";
import type { QuotationPayload } from "@/lib/quotation-types";
import { extractQuotationCustomerFields } from "@/lib/quotation-customer-extract";
import { extractRepresentativeSnapshot } from "@/lib/quotation-representative-extract";
import { resolvePublicAppBase } from "@/lib/app-url";

/**
 * Old integrations wrapped the quote in `{ "json": "<stringified quote>" }`.
 * Unwrap so `customerName`, `Representative`, etc. inside the string are visible to parsers.
 */
function unwrapLegacyQuotePayload(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  const o = input as Record<string, unknown>;
  const jsonStr = o.json;
  if (typeof jsonStr !== "string") {
    return o;
  }
  const trimmed = jsonStr.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return o;
  }
  try {
    const parsed: unknown = JSON.parse(jsonStr);
    if (parsed == null || typeof parsed !== "object") return o;
    const inner = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!inner || typeof inner !== "object" || Array.isArray(inner)) return o;
    const { json: _json, ...wrapperRest } = o;
    return { ...wrapperRest, ...(inner as Record<string, unknown>) };
  } catch {
    return o;
  }
}

/** Matches standard UUID strings so clients can send a template id in `template_key` by mistake. */
const UUID_STRING_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidString(s: string): boolean {
  return UUID_STRING_RE.test(s.trim());
}

function parseInvoiceDate(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const bodyElement = Array.isArray(body) ? body[0] : body;
  if (!bodyElement || typeof bodyElement !== "object") {
    return NextResponse.json(
      { error: "Body must be a quote object or array with one quote object" },
      { status: 400 }
    );
  }

  const root = unwrapLegacyQuotePayload(bodyElement);
  const q = root as QuotationPayload;
  if (typeof q.vat !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid vat" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const quotationId = (q.quotationID ?? "").trim();
  const invoiceId = (q.invoiceID ?? "").trim();

  let templateId: string | null = null;
  const rawTemplateId = (root as { template_id?: string | null }).template_id;
  const rawTemplateKey = (root as { template_key?: string | null }).template_key;
  if (rawTemplateId && typeof rawTemplateId === "string") {
    templateId = rawTemplateId.trim();
  } else if (rawTemplateKey && typeof rawTemplateKey === "string") {
    const key = rawTemplateKey.trim();
    // `template_key` is normally a slug (e.g. elite_rugs); accept UUID here too.
    if (isUuidString(key)) {
      const { data: t } = await supabase
        .from("quote_templates")
        .select("id")
        .eq("id", key)
        .maybeSingle();
      if (t) templateId = t.id;
    } else {
      const { data: t } = await supabase
        .from("quote_templates")
        .select("id")
        .eq("template_key", key)
        .maybeSingle();
      if (t) templateId = t.id;
    }
  }

  // Upsert: match existing row by quotation_id first, then by invoice_id; otherwise insert.
  let quoteId: string;
  let publicId: string;

  let existing: { id: string; public_id: string } | null = null;

  if (quotationId) {
    const { data } = await supabase
      .from("quotes")
      .select("id, public_id")
      .eq("quotation_id", quotationId)
      .maybeSingle();
    if (data) existing = data;
  }

  if (!existing && invoiceId) {
    const { data: rows, error: invErr } = await supabase
      .from("quotes")
      .select("id, public_id")
      .eq("invoice_id", invoiceId)
      .limit(1);
    if (invErr) {
      return NextResponse.json(
        { error: invErr.message ?? "Failed to look up quote by invoiceID" },
        { status: 500 }
      );
    }
    const row = rows?.[0];
    if (row) existing = row;
  }

  const quotationIdForRow = quotationId || null;

  if (existing) {
    quoteId = existing.id;
    publicId = existing.public_id;

    await supabase
      .from("quotes")
      .update({
        vat: q.vat,
        invoice_id: q.invoiceID ?? null,
        project_name: q.projectName ?? null,
        quotation_id: quotationIdForRow,
        special_discount: q.specialDiscount ?? 0,
        require_signature: q.requireSignature ?? true,
        invoice_creation_date: parseInvoiceDate(q.invoiceCreationDate ?? ""),
        agent_code: q.agentCode ?? null,
        agent_desc: q.agentDesc ?? null,
        template_id: templateId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);

    await supabase.from("quote_customers").delete().eq("quote_id", quoteId);
    await supabase.from("quote_representatives").delete().eq("quote_id", quoteId);
    await supabase.from("quote_products").delete().eq("quote_id", quoteId);
    await supabase.from("quote_payment_terms").delete().eq("quote_id", quoteId);
  } else {
    const { data: quoteRow, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        vat: q.vat,
        invoice_id: q.invoiceID ?? null,
        project_name: q.projectName ?? null,
        quotation_id: quotationIdForRow,
        special_discount: q.specialDiscount ?? 0,
        require_signature: q.requireSignature ?? true,
        invoice_creation_date: parseInvoiceDate(q.invoiceCreationDate ?? ""),
        agent_code: q.agentCode ?? null,
        agent_desc: q.agentDesc ?? null,
        template_id: templateId,
      })
      .select("id, public_id")
      .single();

    if (quoteError || !quoteRow) {
      return NextResponse.json(
        { error: quoteError?.message ?? "Failed to create quote" },
        { status: 500 }
      );
    }
    quoteId = quoteRow.id;
    publicId = quoteRow.public_id;
  }

  const {
    customer_id,
    customer_name,
    customer_address,
  } = extractQuotationCustomerFields(root);

  if (
    customer_id ||
    customer_name ||
    customer_address != null
  ) {
    await supabase.from("quote_customers").insert({
      quote_id: quoteId,
      customer_id: customer_id ?? null,
      customer_name: customer_name ?? null,
      customer_address: customer_address,
    });
  }

  const repSnap = extractRepresentativeSnapshot(root);
  if (repSnap) {
    await supabase.from("quote_representatives").insert({
      quote_id: quoteId,
      rep_phone: repSnap.rep_phone,
      rep_email: repSnap.rep_email,
      rep_avatar: repSnap.rep_avatar,
      rep_full_name: repSnap.rep_full_name,
      rep_title: repSnap.rep_title,
    });
  }

  await supabase
    .from("quotes")
    .update({
      representative_snapshot: repSnap,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  const products = Array.isArray(q.products) ? q.products : [];
  if (products.length > 0) {
    await supabase.from("quote_products").insert(
      products.map((p, i) => ({
        quote_id: quoteId,
        sort_order: i,
        qty: p.Qty ?? 0,
        sku: p.SKU ?? null,
        color: p.color ?? null,
        shape: p.shape ?? null,
        material: p.material ?? null,
        technique: p.technique ?? null,
        unit_price: p.unitPrice ?? 0,
        unit_discount: p.unitDiscount ?? 0,
        picture_url: p.pictureurl ?? null,
        product_desc: p.productDesc ?? null,
        additional_desc: p.additionalDesc ?? null,
      }))
    );
  }

  const terms = Array.isArray(q.paymentsTerms) ? q.paymentsTerms : [];
  if (terms.length > 0) {
    await supabase.from("quote_payment_terms").insert(
      terms.map((term, i) => ({
        quote_id: quoteId,
        sort_order: i,
        term: String(term),
      }))
    );
  }

  const baseUrl = resolvePublicAppBase(request);
  const url = `${baseUrl}/${publicId}`;

  const productLines = (Array.isArray(q.products) ? q.products : []).map(
    (p) => ({
      qty: p.Qty ?? 0,
      unitPrice: p.unitPrice ?? 0,
      unitDiscount: p.unitDiscount ?? 0,
    })
  );
  const { total } = calculateQuoteBreakdown({
    vat: q.vat,
    specialDiscount: q.specialDiscount ?? 0,
    lines: productLines,
  });

  return NextResponse.json({
    public_id: publicId,
    quote_id: quoteId,
    template_id: templateId ?? undefined,
    url,
    total,
  });
}
