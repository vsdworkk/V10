"use server"

import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

export default async function BlogLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Home
            </Link>

            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
            >
              <BookOpen className="mr-2 size-4" />
              All Posts
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}
