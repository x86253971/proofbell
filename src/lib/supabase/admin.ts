import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. NEVER import into client code.
// Used by public widget endpoints that read events by a site's public_key.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
