import { NextResponse } from "next/server";
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
