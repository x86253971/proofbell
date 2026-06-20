"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { newPublicKey, newIngestSecret } from "@/lib/ids";

const SiteInput = z.object({
  name: z.string().min(1).max(80),
  domain: z.string().max(120).optional(),
});

export async function createSite(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = SiteInput.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain") || undefined,
  });
  if (!parsed.success) return;

  const { data, error } = await supabase
    .from("sites")
    .insert({
      owner: user.id,
      name: parsed.data.name,
      domain: parsed.data.domain ?? null,
      public_key: newPublicKey(),
      ingest_secret: newIngestSecret(),
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/dashboard");
  redirect(`/dashboard/${data.id}`);
}

const EventInput = z.object({
  site_id: z.string().uuid(),
  type: z.enum(["signup", "subscribe", "purchase", "custom"]),
  name: z.string().max(80).optional(),
  location: z.string().max(80).optional(),
  title: z.string().max(120).optional(),
});

export async function addManualEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = EventInput.safeParse({
    site_id: formData.get("site_id"),
    type: formData.get("type"),
    name: formData.get("name") || undefined,
    location: formData.get("location") || undefined,
    title: formData.get("title") || undefined,
  });
  if (!parsed.success) return;

  const e = parsed.data;
  // RLS ensures the user can only insert events for sites they own.
  await supabase.from("events").insert({
    site_id: e.site_id,
    type: e.type,
    title: e.title ?? "New activity",
    name: e.name ?? null,
    location: e.location ?? null,
    source: "manual",
  });
  revalidatePath(`/dashboard/${e.site_id}`);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
