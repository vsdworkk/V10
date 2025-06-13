"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface BlogSearchProps {
  onSearch: (searchTerm: string) => void
  onCategoryChange: (category: string) => void
  onTagChange: (tag: string) => void
  categories: string[]
  tags: string[]
  searchTerm: string
  selectedCategory: string
  selectedTag: string
}

export default function BlogSearch({
  onSearch,
  onCategoryChange,
  onTagChange,
  categories,
  tags,
  searchTerm,
  selectedCategory,
  selectedTag
}: BlogSearchProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearch)
  }

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === "all" ? "" : value)
  }

  const handleTagChange = (value: string) => {
    onTagChange(value === "all" ? "" : value)
  }

  const clearFilters = () => {
    setLocalSearch("")
    onSearch("")
    onCategoryChange("")
    onTagChange("")
  }

  const hasActiveFilters = searchTerm || selectedCategory || selectedTag

  return (
    <div className="bg-background mb-8 rounded-lg border p-6">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-3 size-4" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Select
              value={selectedCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={selectedTag || "all"}
              onValueChange={handleTagChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    #{tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
      </form>

      {hasActiveFilters && (
        <div className="mt-4 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Category: {selectedCategory}
              </span>
            )}
            {selectedTag && (
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                Tag: #{selectedTag}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
