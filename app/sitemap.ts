import { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.apspitchpro.com"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.64
    },
    {
      url: `${baseUrl}/blog/howtowritestarexamples`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/blog/how-to-use-apspitchpro`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    }
  ]
}
