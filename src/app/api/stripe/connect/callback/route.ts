import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const siteId = searchParams.get("state"); // we pass the site id as state

  if (!code || !siteId) {
    return NextResponse.redirect(`${APP_URL}/dashboard?stripe=error`);
  }

  // Must be signed in and own the site.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${APP_URL}/login`);

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .maybeSingle();
  if (!site) return NextResponse.redirect(`${APP_URL}/dashboard?stripe=error`);

  try {
    const token = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    const accountId = token.stripe_user_id;
    if (!accountId) throw new Error("no account id");

    await supabase
      .from("sites")
      .update({ stripe_account_id: accountId, stripe_connected: true })
      .eq("id", siteId);
  } catch {
    return NextResponse.redirect(`${APP_URL}/dashboard/${siteId}?stripe=error`);
  }

  return NextResponse.redirect(`${APP_URL}/dashboard/${siteId}?stripe=connected`);
}
