import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addManualEvent, updateSettings } from "../actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ stripe?: string }>;
}) {
  const { siteId } = await params;
  const { stripe: stripeStatus } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: site } = await supabase
    .from("sites")
    .select(
      "id, name, domain, public_key, ingest_secret, stripe_connected, settings",
    )
    .eq("id", siteId)
    .maybeSingle();
  if (!site) notFound();

  const settings = (site.settings ?? {}) as {
    position?: string;
    theme?: string;
    display_seconds?: number;
    gap_seconds?: number;
    hide_branding?: boolean;
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("lifetime")
    .eq("id", user.id)
    .maybeSingle();
  const isLifetime = profile?.lifetime === true;

  const { data: events } = await supabase
    .from("events")
    .select("id, type, title, name, location, source, created_at")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false })
    .limit(25);

  const snippet = `<script src="${APP_URL}/embed.js" data-key="${site.public_key}" async></script>`;
  const curl = `curl -X POST ${APP_URL}/api/track \
  -H "Authorization: Bearer ${site.ingest_secret}" \
  -H "Content-Type: application/json" \
  -d '{"type":"subscribe","name":"Alex","location":"Tokyo, JP"}'`;

  const connectUrl =
    `https://connect.stripe.com/oauth/authorize?response_type=code` +
    `&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID ?? ""}` +
    `&scope=read_only&state=${site.id}` +
    `&redirect_uri=${encodeURIComponent(`${APP_URL}/api/stripe/connect/callback`)}`;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-muted-foreground">
          ← All sites
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{site.name}</h1>
        {site.domain && (
          <p className="text-sm text-muted-foreground">{site.domain}</p>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Install the widget</CardTitle>
          <CardDescription>
            Paste this before &lt;/body&gt; on your site. That&apos;s it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
            <code>{snippet}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>2. Connect Stripe</CardTitle>
            {site.stripe_connected && <Badge>Connected</Badge>}
          </div>
          <CardDescription>
            Auto-show real subscribes and purchases from your own Stripe — the
            ProofBell edge for SaaS. Read-only access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stripeStatus === "connected" && (
            <p className="mb-3 text-sm text-primary">Stripe connected.</p>
          )}
          {stripeStatus === "error" && (
            <p className="mb-3 text-sm text-destructive">
              Could not connect Stripe — try again.
            </p>
          )}
          {site.stripe_connected ? (
            <p className="text-sm text-muted-foreground">
              New subscriptions and one-time purchases will appear
              automatically.
            </p>
          ) : (
            <a href={connectUrl} className={buttonVariants()}>
              Connect Stripe
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Or send events yourself</CardTitle>
          <CardDescription>
            POST from your backend. Keep this ingest key secret.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
            <code>{curl}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add a test event</CardTitle>
          <CardDescription>
            Add one manually to preview how the widget looks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={addManualEvent}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="site_id" value={site.id} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                defaultValue="subscribe"
              >
                <option value="signup">signup</option>
                <option value="subscribe">subscribe</option>
                <option value="purchase">purchase</option>
                <option value="custom">custom</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Someone" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Tokyo, JP" />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Widget settings</CardTitle>
          <CardDescription>
            Position, theme, and timing. Changes apply within ~30s (widget
            cache).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="flex flex-col gap-4">
            <input type="hidden" name="site_id" value={site.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  name="position"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  defaultValue={settings.position ?? "bottom-left"}
                >
                  <option value="bottom-left">Bottom left</option>
                  <option value="bottom-right">Bottom right</option>
                  <option value="top-left">Top left</option>
                  <option value="top-right">Top right</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  name="theme"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  defaultValue={settings.theme ?? "light"}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="display_seconds">Show for (seconds)</Label>
                <Input
                  id="display_seconds"
                  name="display_seconds"
                  type="number"
                  min={2}
                  max={30}
                  defaultValue={settings.display_seconds ?? 5}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gap_seconds">Gap between (seconds)</Label>
                <Input
                  id="gap_seconds"
                  name="gap_seconds"
                  type="number"
                  min={2}
                  max={120}
                  defaultValue={settings.gap_seconds ?? 8}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="hide_branding"
                name="hide_branding"
                type="checkbox"
                defaultChecked={settings.hide_branding ?? false}
                disabled={!isLifetime}
                className="h-4 w-4"
              />
              <Label htmlFor="hide_branding" className="font-normal">
                Hide the “Powered by ProofBell” badge
                {!isLifetime && (
                  <Link
                    href="/dashboard"
                    className="ml-2 text-primary underline"
                  >
                    Upgrade ($49)
                  </Link>
                )}
              </Label>
            </div>

            <div>
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(events ?? []).map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between border-b py-2 text-sm last:border-0"
            >
              <span>
                {e.name || "Someone"}
                {e.location ? ` in ${e.location}` : ""} — {e.title}
              </span>
              <Badge variant="outline">{e.source}</Badge>
            </div>
          ))}
          {(!events || events.length === 0) && (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
