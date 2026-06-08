import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

const readmeText = readFileSync(new URL("../../README.md", import.meta.url), {
  encoding: "utf8",
});

describe("launch metadata routes", () => {
  it("keeps poster image generation crawlable while blocking private API routes", () => {
    expect(robots()).toEqual({
      rules: [
        {
          userAgent: "*",
          allow: ["/", "/api/og"],
          disallow: ["/api/auth/", "/api/generate-copy"],
        },
      ],
      sitemap: "https://getgamedaykit.com/sitemap.xml",
    });
  });

  it("publishes the production homepage in the sitemap", () => {
    expect(sitemap()).toEqual([
      {
        url: "https://getgamedaykit.com/",
        lastModified: new Date("2026-06-05"),
        changeFrequency: "weekly",
        priority: 1,
      },
    ]);
  });
});

describe("launch checklist", () => {
  it("documents the Better Auth Google OAuth callback path", () => {
    expect(readmeText).toContain("/api/auth/callback/google");
  });
});
