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
      <div className="bg-background mb-4 rounded-lg border p-4 transition-shadow duration-200 hover:shadow-sm">
        {data.image && (
          <Image
            className="mb-4 rounded-t-lg border object-cover"
            src={data.image}
            width={1200}
            height={630}
            alt={data.title}
            priority={priority}
          />
        )}
        {!data.image && <div className="mb-4 h-[180px] rounded bg-gray-200" />}

        {data.categories && data.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {data.categories.map(category => (
              <span
                key={category}
                className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="mb-2 flex items-center justify-between">
          <time
            dateTime={data.publishedAt}
            className="text-muted-foreground text-sm"
          >
            {formatDate(data.publishedAt)}
          </time>

          {data.readingTime && (
            <div className="text-muted-foreground flex items-center text-xs">
              <Clock className="mr-1 size-3" />
              {data.readingTime} min read
            </div>
          )}
        </div>

        <h3 className="mb-2 text-xl font-semibold">{data.title}</h3>
        <p className="text-foreground mb-4">{data.summary}</p>

        {data.tags && data.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            <Tag className="text-muted-foreground mr-1 mt-0.5 size-3" />
            {data.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-muted-foreground text-xs">
                #{tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-muted-foreground text-xs">
                +{data.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
