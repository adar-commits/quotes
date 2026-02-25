import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { QuotationPayload } from "@/lib/quotation-types";

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

  const raw = Array.isArray(body) ? body[0] : body;
  if (!raw || typeof raw !== "object") {
    return NextResponse.json(
      { error: "Body must be a quote object or array with one quote object" },
      { status: 400 }
    );
  }

  const q = raw as QuotationPayload;
  if (typeof q.vat !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid vat" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const quotationId = (q.quotationID ?? "").trim();

  // If quotation_id (e.g. OP-xxx) is sent and exists, update that quote instead of creating
  let quoteId: string;
  let publicId: string;

  if (quotationId) {
    const { data: existing } = await supabase
      .from("quotes")
      .select("id, public_id")
      .eq("quotation_id", quotationId)
      .maybeSingle();

    if (existing) {
      quoteId = existing.id;
      publicId = existing.public_id;

      await supabase.from("quotes").update({
        vat: q.vat,
        invoice_id: q.invoiceID ?? null,
        project_name: q.projectName ?? null,
        quotation_id: quotationId,
        special_discount: q.specialDiscount ?? 0,
        require_signature: q.requireSignature ?? true,
        invoice_creation_date: parseInvoiceDate(q.invoiceCreationDate ?? ""),
        agent_code: q.agentCode ?? null,
        agent_desc: q.agentDesc ?? null,
        updated_at: new Date().toISOString(),
      }).eq("id", quoteId);

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
          quotation_id: quotationId,
          special_discount: q.specialDiscount ?? 0,
          require_signature: q.requireSignature ?? true,
          invoice_creation_date: parseInvoiceDate(q.invoiceCreationDate ?? ""),
          agent_code: q.agentCode ?? null,
          agent_desc: q.agentDesc ?? null,
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
  } else {
    const { data: quoteRow, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        vat: q.vat,
        invoice_id: q.invoiceID ?? null,
        project_name: q.projectName ?? null,
        quotation_id: null,
        special_discount: q.specialDiscount ?? 0,
        require_signature: q.requireSignature ?? true,
        invoice_creation_date: parseInvoiceDate(q.invoiceCreationDate ?? ""),
        agent_code: q.agentCode ?? null,
        agent_desc: q.agentDesc ?? null,
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

  const customer = q.customer;
  if (customer) {
    await supabase.from("quote_customers").insert({
      quote_id: quoteId,
      customer_id: customer.customerID ?? null,
      customer_name: customer.customerName ?? null,
      customer_address: customer.customerAddress ?? null,
    });
  }

  const rep = q.Representative;
  if (rep) {
    await supabase.from("quote_representatives").insert({
      quote_id: quoteId,
      rep_phone: rep.repPhone ?? null,
      rep_avatar: rep.repAvatar ?? null,
      rep_full_name: rep.repFullName ?? null,
    });
  }

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

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    request.nextUrl.origin;
  const url = `${baseUrl}/${publicId}`;

  return NextResponse.json({
    public_id: publicId,
    quote_id: quoteId,
    url,
  });
}
