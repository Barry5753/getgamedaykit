import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/api/auth/", "/api/generate-copy"],
      },
    ],
    sitemap: "https://getgamedaykit.com/sitemap.xml",
  };
}
