import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://getgamedaykit.com/",
      lastModified: new Date("2026-06-05"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
