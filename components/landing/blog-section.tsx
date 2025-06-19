import BlogCard from "@/components/blog-card"
import Section from "@/components/section"
import { getBlogPosts } from "@/lib/blog"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function BlogSection() {
  const allPosts = await getBlogPosts()

  const articles = allPosts
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3) // Show only the latest 3 posts

  return (
    <Section title="Blog" subtitle="Latest Articles">
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((data, idx) => (
          <BlogCard key={data.slug} data={data} priority={idx <= 1} />
        ))}
      </div>

      {allPosts.length > 3 && (
        <div className="text-center">
          <Link href="/blog">
            <Button
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              View All Posts
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      )}
    </Section>
  )
}
