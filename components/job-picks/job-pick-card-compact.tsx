/**
 * @file components/job-picks/job-pick-card-compact.tsx
 * @description
 * Compact job card component for the left panel of split-view layout.
 * Shows essential job details and handles click events to select a job.
 */

"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Building2, MapPin, CalendarDays } from "lucide-react"
import type { SelectJobPick } from "@/types"
import { cn } from "@/lib/utils"
import JobPickShareButton from "./job-pick-share-button"

/**
 * Safely formats a date value to a compact date format.
 */
function formatCompactDate(date?: Date | string | null): string {
  if (!date) return "—"
  try {
    const d = typeof date === "string" ? new Date(date) : date
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short"
    })
  } catch {
    return "—"
  }
}

interface JobPickCardCompactProps extends SelectJobPick {
  isSelected?: boolean
  onClick?: () => void
}

export default function JobPickCardCompact({
  title,
  agency,
  classification,
  location,
  closingDate,
  salary,
  isSelected = false,
  onClick,
  ...pick
}: JobPickCardCompactProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "hover:border-gray-300"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Building2 className="size-3" />
              <span className="truncate">{agency}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {classification}
            </Badge>
            <div onClick={(e) => e.stopPropagation()}>
              <JobPickShareButton 
                job={{ 
                  title, 
                  agency, 
                  classification, 
                  location, 
                  closingDate, 
                  salary, 
                  ...pick 
                }}
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-1 text-xs text-muted-foreground">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              <span className="truncate">{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            <span>Closes: {formatCompactDate(closingDate)}</span>
          </div>
          {salary && (
            <div className="text-xs font-medium text-foreground truncate">
              {salary}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 