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
        "cursor-pointer transition-all duration-200 hover:shadow-sm border-gray-100 bg-white",
        isSelected ? "border-blue-200 bg-blue-50 shadow-sm ring-1 ring-blue-100" : "hover:border-gray-200 hover:bg-gray-50/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              <span className="truncate">{agency}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="secondary" className="text-sm px-2 py-1">
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
                className="size-7"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="size-4" />
              <span className="truncate">{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            <span>Closes: {formatCompactDate(closingDate)}</span>
          </div>
          {salary && (
            <div className="text-sm font-medium text-foreground truncate">
              {salary}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 