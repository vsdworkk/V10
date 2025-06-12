import { Post } from "@/types"

export function filterPosts(
  posts: Post[],
  searchTerm?: string,
  category?: string,
  tag?: string
): Post[] {
  return posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !category || 
      post.categories?.includes(category)

    const matchesTag = !tag || 
      post.tags?.includes(tag)

    return matchesSearch && matchesCategory && matchesTag
  })
} 