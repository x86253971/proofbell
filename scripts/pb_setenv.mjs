// One-off: push production env vars to Vercel via REST API (CLI env-add is broken on this box).
import { readFileSync } from "node:fs";

const TOKEN = process.env.VC_TOKEN;
const PROJECT = "prj_UHFgSG7bagc6OZj4Nvov9s8m7Kxj";
const TEAM = "team_L5DXjdZx1SSRk5txPATXfvV6";
if (!TOKEN) throw new Error("VC_TOKEN missing");

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

// What goes to production. APP_URL overridden; webhook secret + connect id deferred/empty.
const PLAIN = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_STRIPE_PRICE_ID",
  "NEXT_PUBLIC_APP_URL",
]);
const vars = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PRICE_ID: env.NEXT_PUBLIC_STRIPE_PRICE_ID,
  RESEND_API_KEY: env.RESEND_API_KEY,
  NEXT_PUBLIC_APP_URL: "https://proofbell.vercel.app",
};

const base = `https://api.vercel.com/v10/projects/${PROJECT}/env?teamId=${TEAM}&upsert=true`;
for (const [key, value] of Object.entries(vars)) {
  if (value == null || value === "") {
    console.log(`SKIP ${key} (empty)`);
    continue;
  }
  const res = await fetch(base, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: PLAIN.has(key) ? "plain" : "encrypted",
      target: ["production"],
    }),
  });
  const j = await res.json();
  console.log(`${res.status} ${key} ${res.ok ? "OK" : JSON.stringify(j.error)}`);
}
