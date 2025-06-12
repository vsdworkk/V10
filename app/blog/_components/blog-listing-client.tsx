"use client"

import { useState, useMemo } from "react"
import { Post } from "@/types"
import { filterPosts } from "@/lib/client-blog-utils"
import BlogCard from "@/components/blog-card"
import BlogSearch from "@/components/blog-search"

interface BlogListingClientProps {
  initialPosts: Post[]
  categories: string[]
  tags: string[]
}

export default function BlogListingClient({
  initialPosts,
  categories,
  tags,
}: BlogListingClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTag, setSelectedTag] = useState("")

  const filteredPosts = useMemo(() => {
    return filterPosts(initialPosts, searchTerm, selectedCategory, selectedTag)
  }, [initialPosts, searchTerm, selectedCategory, selectedTag])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag)
  }

  return (
    <div>
      <BlogSearch
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onTagChange={handleTagChange}
        categories={categories}
        tags={tags}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
      />

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPosts.length} of {initialPosts.length} posts
        </p>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, idx) => (
            <BlogCard key={post.slug} data={post} priority={idx <= 2} />
          ))}
        </div>
      )}
    </div>
  )
} 