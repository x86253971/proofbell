import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSite, signOut } from "./actions";
import { startCheckout } from "./billing-actions";
import { Button } from "@/components/ui/button";
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { upgraded } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: sites }, { data: profile }] = await Promise.all([
    supabase
      .from("sites")
      .select("id, name, domain, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("lifetime").eq("id", user.id).maybeSingle(),
  ]);
  const isLifetime = profile?.lifetime === true;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your sites</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {isLifetime && <Badge>Lifetime</Badge>}
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {upgraded && (
        <p className="mb-6 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          Thanks! Your lifetime upgrade is being activated.
        </p>
      )}

      {!isLifetime && (
        <Card className="mb-8 border-primary/40">
          <CardHeader>
            <CardTitle>Go lifetime — $49 once</CardTitle>
            <CardDescription>
              Unlimited sites and events, remove the ProofBell badge. No
              subscription, ever.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={startCheckout}>
              <Button type="submit">Upgrade for $49</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add a site</CardTitle>
          <CardDescription>
            Create a site to get your embed snippet and ingest key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Acme SaaS" required />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="domain">Domain (optional)</Label>
              <Input id="domain" name="domain" placeholder="acme.com" />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {(sites ?? []).map((s) => (
          <Link key={s.id} href={`/dashboard/${s.id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  {s.domain && (
                    <p className="text-sm text-muted-foreground">{s.domain}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">Manage →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!sites || sites.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No sites yet — create your first one above.
          </p>
        )}
      </div>
    </main>
  );
}
