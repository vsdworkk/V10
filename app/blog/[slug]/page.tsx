import { notFound } from "next/navigation"
import { getPost, getBlogPosts } from "@/lib/blog"
import { formatDate } from "@/lib/utils"
import { Clock, Tag } from "lucide-react"
import Author from "@/components/blog-author"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  try {
    const post = await getPost(slug)

    return (
      <article className="container mx-auto max-w-4xl px-4 py-16">
        <header className="mb-8">
          {post.categories && post.categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map(category => (
                <span
                  key={category}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <time
                dateTime={post.publishedAt}
                className="text-muted-foreground"
              >
                {formatDate(post.publishedAt)}
              </time>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">By {post.author}</span>
            </div>

            {post.readingTime && (
              <div className="text-muted-foreground flex items-center text-sm">
                <Clock className="mr-1 size-4" />
                {post.readingTime} min read
              </div>
            )}
          </div>

          {post.summary && (
            <p className="text-muted-foreground mb-8 text-xl">{post.summary}</p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-2 border-b pb-8">
              <Tag className="text-muted-foreground size-4" />
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-muted-foreground bg-muted rounded px-2 py-1 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.source }}
        />
      </article>
    )
  } catch (error) {
    console.error("Error loading blog post:", error)
    notFound()
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts()
    return posts.map(post => ({
      slug: post.slug
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}
