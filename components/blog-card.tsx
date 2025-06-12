"use client"

import { Post } from "@/types"
import { formatDate } from "@/lib/utils"
import { Clock, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface BlogCardProps {
  data: Post
  priority?: boolean
}

export default function BlogCard({ data, priority }: BlogCardProps) {
  return (
    <Link href={`/blog/${data.slug}`} className="block">
      <div className="bg-background rounded-lg p-4 mb-4 border hover:shadow-sm transition-shadow duration-200">
        {data.image && (
          <Image
            className="rounded-t-lg object-cover border mb-4"
            src={data.image}
            width={1200}
            height={630}
            alt={data.title}
            priority={priority}
          />
        )}
        {!data.image && <div className="bg-gray-200 h-[180px] mb-4 rounded" />}
        
        {data.categories && data.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {data.categories.map((category) => (
              <span
                key={category}
                className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <time
            dateTime={data.publishedAt}
            className="text-sm text-muted-foreground"
          >
            {formatDate(data.publishedAt)}
          </time>
          
          {data.readingTime && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {data.readingTime} min read
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{data.title}</h3>
        <p className="text-foreground mb-4">{data.summary}</p>
        
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <Tag className="h-3 w-3 text-muted-foreground mr-1 mt-0.5" />
            {data.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{data.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
} 