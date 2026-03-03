import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/dashboard/", "/settings/", "/login", "/signup"],
      },
    ],
    sitemap: "https://traction-ai.me/sitemap.xml",
  };
}
