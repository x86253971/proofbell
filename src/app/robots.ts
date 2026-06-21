import type { MetadataRoute } from "next";

// Swap base to https://proofbell.com once the domain is live.
const base = "https://proofbell.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
