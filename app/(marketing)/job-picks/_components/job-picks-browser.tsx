/**
 * @file app/(marketing)/job-picks/_components/job-picks-browser.tsx
 * @description Client wrapper that renders filters and a responsive grid of job picks.
 * Accepts `picks` data and `children` (server-rendered JobPickCard nodes) and controls
 * visibility based on client-side filter selections from JobPickFilters. This pattern
 * reuses the existing server JobPickCard by passing it as children instead of importing
 * a server component into the client, which is disallowed. :contentReference[oaicite:6]{index=6}
 *
 * Inputs:
 * - picks: SelectJobPick[] — list of picks for this month group
 * - children: React.ReactNode — array of <JobPickCard /> nodes in the same order as picks
 *
 * Behavior:
 * - Initializes visibleIds to all pick ids
 * - Uses JobPickFilters to compute filtered subset and updates visibleIds
 * - Renders a CSS grid and conditionally hides non-matching children
 *
 * Edge cases:
 * - If children count does not match picks length, the extra nodes are ignored
 * - Empty filter result shows a small empty state
 */

"use client"

import * as React from "react"
import type { SelectJobPick } from "@/types"
import JobPickFilters from "@/components/job-picks/job-pick-filters" /* uses client-side Select UI and emits filtered list */ /* :contentReference[oaicite:7]{index=7} */

interface JobPicksBrowserProps {
  picks: SelectJobPick[]
  children: React.ReactNode
}

export default function JobPicksBrowser({ picks, children }: JobPicksBrowserProps) {
  const nodes = React.Children.toArray(children)
  const [visibleIds, setVisibleIds] = React.useState<Set<string>>(
    () => new Set(picks.map((p) => p.id))
  )

  const handleFilterChange = React.useCallback((filtered: SelectJobPick[]) => {
    setVisibleIds(new Set(filtered.map((p) => p.id)))
  }, [])

  const total = picks.length
  const visibleCount = React.useMemo(
    () => (total === 0 ? 0 : Array.from(visibleIds).length),
    [visibleIds, total]
  )

  return (
    <div className="space-y-4">
      <JobPickFilters picks={picks} onChange={handleFilterChange} />

      <div className="text-muted-foreground text-sm">
        Showing {visibleCount} of {total} role{total === 1 ? "" : "s"}
      </div>

      {visibleCount === 0 ? (
        <div className="text-muted-foreground rounded-md border p-6 text-center text-sm">
          No roles match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {picks.map((p, idx) => {
            const child = nodes[idx]
            if (!child) return null
            const isVisible = visibleIds.has(p.id)
            return (
              <div key={p.id} className={isVisible ? "" : "hidden"}>
                {child}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}