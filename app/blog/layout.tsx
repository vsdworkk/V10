"use server"

import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <Link 
              href="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              All Posts
            </Link>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  )
} 