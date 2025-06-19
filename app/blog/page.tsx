import { Suspense } from "react"
import { getBlogPosts, getUniqueCategoriesAndTags } from "@/lib/blog"
import { BlogListingClient } from "./_components"
import { Skeleton } from "@/components/ui/skeleton"

export default async function BlogPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Blog</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Insights, tutorials, and updates from our team. Stay informed about
          the latest trends in SaaS, technology, and business growth.
        </p>
      </header>

      <Suspense fallback={<BlogListingSkeleton />}>
        <BlogListingFetcher />
      </Suspense>
    </div>
  )
}

async function BlogListingFetcher() {
  const [posts, { categories, tags }] = await Promise.all([
    getBlogPosts(),
    getUniqueCategoriesAndTags()
  ])

  const sortedPosts = posts.sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  )

  return (
    <BlogListingClient
      initialPosts={sortedPosts}
      categories={categories}
      tags={tags}
    />
  )
}

function BlogListingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Search skeleton */}
      <div className="bg-background rounded-lg border p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>

      {/* Posts grid skeleton */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-4 h-48 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
