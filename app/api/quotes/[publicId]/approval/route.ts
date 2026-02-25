import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

const ALLOWED_STATUSES = ["approved", "alternative", "rejected"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  let body: { productSortOrder?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sortOrder = typeof body.productSortOrder === "number" ? body.productSortOrder : undefined;
  const status = typeof body.status === "string" && ALLOWED_STATUSES.includes(body.status as (typeof ALLOWED_STATUSES)[number])
    ? body.status
    : undefined;

  if (sortOrder === undefined || status === undefined) {
    return NextResponse.json(
      { error: "Body must include productSortOrder (number) and status (approved | alternative | rejected)" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id")
    .eq("public_id", publicId)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("quote_products")
    .update({ approval_status: status })
    .eq("quote_id", quote.id)
    .eq("sort_order", sortOrder);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message ?? "Failed to update approval status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, status });
}
