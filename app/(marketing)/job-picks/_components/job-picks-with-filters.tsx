/**
 * @file app/(marketing)/job-picks/_components/job-picks-with-filters.tsx
 * @description
 * Client component that manages global filtering for all job picks and renders
 * the filtered results grouped by month. The filters are positioned at the top
 * level for a clean search-like interface.
 */

"use client"

import * as React from "react"
import type { SelectJobPick } from "@/types"
import JobPickFilters from "@/components/job-picks/job-pick-filters"
import JobPicksSplitBrowser from "@/app/(marketing)/job-picks/_components/job-picks-split-browser"

interface JobPicksWithFiltersProps {
  picks: SelectJobPick[]
}

/**
 * Formats a "YYYY-MM" monthTag to "Month YYYY" (e.g., "2025-08" -> "August 2025").
 */
function formatMonthTag(tag: string): string {
  const [y, m] = tag.split("-").map(Number)
  const date = new Date(y, (m || 1) - 1, 1)
  return date.toLocaleDateString("en-AU", { month: "long", year: "numeric" })
}

/**
 * Groups job picks by monthTag.
 */
function groupByMonthTag(
  picks: SelectJobPick[]
): Record<string, SelectJobPick[]> {
  return picks.reduce(
    (acc, p) => {
      const key = p.monthTag
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    },
    {} as Record<string, SelectJobPick[]>
  )
}

export default function JobPicksWithFilters({
  picks
}: JobPicksWithFiltersProps) {
  const [filteredPicks, setFilteredPicks] =
    React.useState<SelectJobPick[]>(picks)

  const handleFilterChange = React.useCallback((filtered: SelectJobPick[]) => {
    setFilteredPicks(filtered)
  }, [])

  // Update filtered picks when props change
  React.useEffect(() => {
    setFilteredPicks(picks)
  }, [picks])

  const groups = React.useMemo(
    () => groupByMonthTag(filteredPicks),
    [filteredPicks]
  )
  const monthKeys = React.useMemo(
    () => Object.keys(groups).sort((a, b) => b.localeCompare(a)), // latest first
    [groups]
  )

  const totalVisible = filteredPicks.length
  const totalOriginal = picks.length

  return (
    <div className="space-y-8">
      {/* Global filter bar with search-like styling */}
      <div className="mx-auto max-w-4xl">
        <JobPickFilters
          picks={picks}
          onChange={handleFilterChange}
          className="shadow-sm"
        />

        {/* Results count */}
        <div className="text-muted-foreground mt-4 text-center text-sm">
          Showing {totalVisible} of {totalOriginal} role
          {totalOriginal === 1 ? "" : "s"}
        </div>
      </div>

      {/* Filtered results grouped by month */}
      <div className="space-y-12">
        {totalVisible === 0 ? (
          <div className="py-12 text-center">
            <div className="text-muted-foreground mx-auto max-w-md rounded-md border p-8">
              No roles match your filters. Try adjusting your search criteria.
            </div>
          </div>
        ) : (
          monthKeys.map(key => {
            const monthPicks = groups[key]
            return (
              <div key={key} className="space-y-6">
                {/* Split-view browser with clickable cards and detail panel */}
                <JobPicksSplitBrowser picks={monthPicks} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
