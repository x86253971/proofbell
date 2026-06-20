import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Events from a CONNECTED account (Stripe Connect) carry `account`.
  // These are the founder's own subscribe/purchase events -> ingest as social proof.
  if (event.account) {
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("stripe_account_id", event.account)
      .maybeSingle();
    if (!site) return NextResponse.json({ received: true });

    let row: {
      type: "subscribe" | "purchase";
      title: string;
      amount_cents: number | null;
      currency: string | null;
    } | null = null;

    if (event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const price = sub.items.data[0]?.price;
      row = {
        type: "subscribe",
        title: "New subscription",
        amount_cents: price?.unit_amount ?? null,
        currency: price?.currency ?? null,
      };
    } else if (event.type === "checkout.session.completed") {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.mode === "payment") {
        row = {
          type: "purchase",
          title: "New purchase",
          amount_cents: cs.amount_total ?? null,
          currency: cs.currency ?? null,
        };
      }
    }

    if (row) {
      await supabase.from("events").insert({
        site_id: site.id,
        type: row.type,
        title: row.title,
        name: null, // privacy: anonymized
        amount_cents: row.amount_cents,
        currency: row.currency,
        source: "stripe",
        external_id: event.id,
      });
    }
    return NextResponse.json({ received: true });
  }

  // PLATFORM event (our own account): the $49 lifetime purchase.
  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;
    const userId = cs.metadata?.user_id;
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          lifetime: true,
          stripe_customer_id:
            typeof cs.customer === "string" ? cs.customer : null,
        })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
