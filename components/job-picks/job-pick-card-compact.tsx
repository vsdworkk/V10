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
        "cursor-pointer border-gray-100 bg-white transition-all duration-200 hover:shadow-sm",
        isSelected
          ? "border-blue-200 bg-blue-50 shadow-sm ring-1 ring-blue-100"
          : "hover:border-gray-200 hover:bg-gray-50/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="px-4 pb-3 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
              {title}
            </h3>
            <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs sm:text-sm">
              <Building2 className="size-3 shrink-0 sm:size-4" />
              <span className="truncate">{agency}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-wrap gap-1">
              {Array.isArray(classification) ? (
                classification.map((cls, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-1.5 py-0.5 text-xs sm:px-2 sm:py-1"
                  >
                    {cls}
                  </Badge>
                ))
              ) : (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-xs sm:px-2 sm:py-1"
                >
                  {classification}
                </Badge>
              )}
            </div>
            <div onClick={e => e.stopPropagation()}>
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
                className="size-6 shrink-0 sm:size-7"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 sm:px-6">
        <div className="text-muted-foreground space-y-2 text-xs sm:text-sm">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0 sm:size-4" />
              <span className="truncate">{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="size-3 shrink-0 sm:size-4" />
            <span>Closes: {formatCompactDate(closingDate)}</span>
          </div>
          {salary && (
            <div className="text-foreground truncate text-xs font-medium sm:text-sm">
              {salary}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
