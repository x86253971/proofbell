import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  type: z.enum(["signup", "subscribe", "purchase", "custom"]),
  title: z.string().min(1).max(120).optional(),
  name: z.string().max(80).optional(),
  location: z.string().max(80).optional(),
  amount_cents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  external_id: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  if (!secret.startsWith("sk_")) {
    return NextResponse.json({ error: "Missing ingest secret" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("ingest_secret", secret)
    .maybeSingle();
  if (!site) {
    return NextResponse.json({ error: "Invalid ingest secret" }, { status: 401 });
  }

  const e = parsed.data;
  const title =
    e.title ??
    (e.type === "subscribe"
      ? "New subscription"
      : e.type === "purchase"
        ? "New purchase"
        : e.type === "signup"
          ? "New signup"
          : "New activity");

  const { error } = await supabase.from("events").insert({
    site_id: site.id,
    type: e.type,
    title,
    name: e.name ?? null,
    location: e.location ?? null,
    amount_cents: e.amount_cents ?? null,
    currency: e.currency ?? null,
    external_id: e.external_id ?? null,
    source: "api",
  });
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
