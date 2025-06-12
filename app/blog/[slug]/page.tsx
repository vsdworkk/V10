"use server"

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
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between mb-6">
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
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {post.readingTime} min read
              </div>
            )}
          </div>

          {post.summary && (
            <p className="text-xl text-muted-foreground mb-8">{post.summary}</p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-sm text-muted-foreground bg-muted rounded"
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
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
} 