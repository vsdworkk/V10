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
  SelectValue,
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
  selectedTag,
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
    <div className="bg-background border rounded-lg p-6 mb-8">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
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
                {categories.map((category) => (
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
                {tags.map((tag) => (
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
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </form>
      
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Category: {selectedCategory}
              </span>
            )}
            {selectedTag && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Tag: #{selectedTag}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 