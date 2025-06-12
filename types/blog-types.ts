export interface Post {
  title: string
  publishedAt: string
  summary: string
  author: string
  slug: string
  image?: string
  categories?: string[]
  tags?: string[]
  readingTime?: number
}

export interface BlogPostData extends Post {
  source: string
}

export interface BlogSearchParams {
  search?: string
  category?: string
  tag?: string
} 