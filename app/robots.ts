// app/robots.ts
import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"

const baseUrl = siteConfig.url.replace(/\/$/, "")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow auth and app-internal areas you don't want indexed:
        disallow: ["/api/", "/dashboard/", "/login", "/signup"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
