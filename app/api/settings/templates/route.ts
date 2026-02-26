import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("quote_templates")
    .select("*")
    .order("template_key", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : null;
  const template_key = typeof body.template_key === "string" ? body.template_key.trim().toLowerCase().replace(/\s+/g, "_") : null;
  if (!name || !template_key) {
    return NextResponse.json(
      { error: "name and template_key are required" },
      { status: 400 }
    );
  }

  const row: Record<string, unknown> = {
    name,
    template_key,
    main_color: typeof body.main_color === "string" ? body.main_color : "#801a1e",
    bullets_color: body.bullets_color ?? null,
    banner_url: body.banner_url ?? null,
    background_url: body.background_url ?? null,
    favicon_url: body.favicon_url ?? null,
    logo_url: body.logo_url ?? null,
    contact_strip_bg: body.contact_strip_bg ?? null,
  };

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("quote_templates")
    .insert(row)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "template_key already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
