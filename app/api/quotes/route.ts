import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { calculateQuoteBreakdown } from "@/lib/quote-total";
import type { QuotationPayload } from "@/lib/quotation-types";
import { extractQuotationCustomerFields } from "@/lib/quotation-customer-extract";
import { extractRepresentativeSnapshot } from "@/lib/quotation-representative-extract";
import {
  agentCodeForDb,
  agentDescForDb,
  honorificLineForDb,
  invoiceCreationDateString,
  invoiceIdForStorage,
  invoiceIdLookupVariants,
  paymentsTermsArray,
  productsArray,
  projectNameForDb,
  quotationIdForLookup,
  requireSignatureBool,
  specialDiscountNumber,
  vatNumber,
} from "@/lib/quotation-payload-aliases";
import { resolvePublicAppBase } from "@/lib/app-url";
import { normalizeQuoteRequestRoot } from "@/lib/quotation-request-root";

/** Some clients send `[[{...}]]`; peel single-element array wrappers until we hit an object. */
function unwrapNestedSingletonArrays(input: unknown): unknown {
  let cur = input;
  while (Array.isArray(cur) && cur.length === 1) {
    cur = cur[0];
  }
  return cur;
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
    const text = await request.text();
    body = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const first = Array.isArray(body) ? body[0] : body;
  const peeled = unwrapNestedSingletonArrays(first);
  if (peeled == null || typeof peeled !== "object" || Array.isArray(peeled)) {
    return NextResponse.json(
      {
        error:
          "Body must be a quote object or array with one quote object",
      },
      { status: 400 }
    );
  }

  const root = normalizeQuoteRequestRoot(peeled as Record<string, unknown>);
  const vat = vatNumber(root);
  if (vat === undefined) {
    return NextResponse.json(
      { error: "Missing or invalid vat" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const quotationId = quotationIdForLookup(root);
  const invoiceVariants = invoiceIdLookupVariants(root);

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

  if (!existing && invoiceVariants.length > 0) {
    // Deterministic: oldest row per invoice_id wins, so the same `public_id`
    // is reused on every subsequent POST (a unique partial index also enforces
    // one-row-per-invoice_id at the DB level).
    const { data: rows, error: invErr } = await supabase
      .from("quotes")
      .select("id, public_id")
      .in("invoice_id", invoiceVariants)
      .order("created_at", { ascending: true })
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
  const invoiceIdStored = invoiceIdForStorage(root);

  if (existing) {
    quoteId = existing.id;
    publicId = existing.public_id;

    const { error: updateErr } = await supabase
      .from("quotes")
      .update({
        vat,
        invoice_id: invoiceIdStored,
        project_name: projectNameForDb(root),
        quotation_id: quotationIdForRow,
        special_discount: specialDiscountNumber(root),
        require_signature: requireSignatureBool(root),
        invoice_creation_date: parseInvoiceDate(invoiceCreationDateString(root)),
        agent_code: agentCodeForDb(root),
        agent_desc: agentDescForDb(root),
        honorific_line: honorificLineForDb(root),
        template_id: templateId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quoteId);
    if (updateErr) {
      console.error("quotes update:", updateErr);
      return NextResponse.json(
        { error: "Failed to update quote" },
        { status: 500 }
      );
    }

    await supabase.from("quote_customers").delete().eq("quote_id", quoteId);
    await supabase.from("quote_representatives").delete().eq("quote_id", quoteId);
    await supabase.from("quote_products").delete().eq("quote_id", quoteId);
    await supabase.from("quote_payment_terms").delete().eq("quote_id", quoteId);
  } else {
    const { data: quoteRow, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        vat,
        invoice_id: invoiceIdStored,
        project_name: projectNameForDb(root),
        quotation_id: quotationIdForRow,
        special_discount: specialDiscountNumber(root),
        require_signature: requireSignatureBool(root),
        invoice_creation_date: parseInvoiceDate(invoiceCreationDateString(root)),
        agent_code: agentCodeForDb(root),
        agent_desc: agentDescForDb(root),
        honorific_line: honorificLineForDb(root),
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
    const { error: custErr } = await supabase.from("quote_customers").insert({
      quote_id: quoteId,
      customer_id: customer_id ?? null,
      customer_name: customer_name ?? null,
      customer_address: customer_address,
    });
    if (custErr) {
      console.error("quote_customers insert:", custErr);
      return NextResponse.json(
        { error: "Failed to save customer details" },
        { status: 500 }
      );
    }
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

  const products = productsArray(root) as QuotationPayload["products"];
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

  const terms = paymentsTermsArray(root) as string[];
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

  const productLines = products.map((p) => ({
    qty: p.Qty ?? 0,
    unitPrice: p.unitPrice ?? 0,
    unitDiscount: p.unitDiscount ?? 0,
  }));
  const { total } = calculateQuoteBreakdown({
    vat,
    specialDiscount: specialDiscountNumber(root),
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
