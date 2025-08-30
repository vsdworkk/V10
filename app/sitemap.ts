// app/sitemap.ts
import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"
import { getBlogPosts } from "@/lib/blog"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, "")

  // Key marketing & blog index pages
  const staticPaths = [
    "",
    "/about",
    "/features",
    "/pricing",
    "/contact",
    "/blog"
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(p => ({
    url: `${baseUrl}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7
  }))

  // Blog posts
  const posts = await getBlogPosts()
  const blogEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8
  }))

  return [...staticEntries, ...blogEntries]
}
