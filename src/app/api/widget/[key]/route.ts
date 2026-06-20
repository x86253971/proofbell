import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

type Settings = {
  max_events?: number;
  show_recent_window_days?: number;
  display_seconds?: number;
  gap_seconds?: number;
  position?: string;
  theme?: string;
  hide_branding?: boolean;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!key.startsWith("pk_")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400, headers: CORS });
  }

  const supabase = createAdminClient();
  const { data: site, error: siteErr } = await supabase
    .from("sites")
    .select("id, owner, settings")
    .eq("public_key", key)
    .maybeSingle();

  if (siteErr) {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500, headers: CORS });
  }
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404, headers: CORS });
  }

  // Branding can only be hidden by paying ($49 lifetime) owners.
  const { data: owner } = await supabase
    .from("profiles")
    .select("lifetime")
    .eq("id", site.owner)
    .maybeSingle();
  const isLifetime = owner?.lifetime === true;

  const s = (site.settings ?? {}) as Settings;
  const max = Math.min(Math.max(s.max_events ?? 20, 1), 50);
  const windowDays = s.show_recent_window_days ?? 30;
  const since = new Date(Date.now() - windowDays * 86400_000).toISOString();

  const { data: events, error: evErr } = await supabase
    .from("events")
    .select("type, title, name, location, amount_cents, currency, created_at")
    .eq("site_id", site.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(max);

  if (evErr) {
    return NextResponse.json({ error: "Events failed" }, { status: 500, headers: CORS });
  }

  return NextResponse.json(
    {
      config: {
        position: s.position ?? "bottom-left",
        theme: s.theme ?? "light",
        display_seconds: s.display_seconds ?? 5,
        gap_seconds: s.gap_seconds ?? 8,
        hide_branding: isLifetime ? (s.hide_branding ?? false) : false,
      },
      events: events ?? [],
    },
    { headers: { ...CORS, "Cache-Control": "public, max-age=30" } },
  );
}
