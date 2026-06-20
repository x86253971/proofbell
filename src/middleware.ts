import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Skip static assets, the public embed script, and public widget/track APIs.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|embed.js|api/widget|api/track|.*\..*).*)",
  ],
};
