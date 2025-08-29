/**
 * @file components/job-picks/job-pick-filters.tsx
 * @description
 * Client-side filter bar for the public APS Job Picks page.
 * Provides in-memory filtering by APS classification and agency, and emits
 * the filtered list to the parent via a callback.
 *
 * Key features:
 * - Two dropdowns using Shadcn UI Select: classification and agency.
 * - "Clear" button resets filters to show all.
 * - Emits filtered list on each change via onChange.
 *
 * Inputs:
 * - picks: SelectJobPick[] — the full list to filter.
 * - onChange: (filtered: SelectJobPick[]) => void — callback to receive filtered results.
 * - className?: string — optional wrapper class.
 *
 * Outputs:
 * - None returned. Calls onChange whenever filters change.
 *
 * Edge cases and notes:
 * - If picks is empty, controls are disabled.
 * - Agencies are derived from picks, de-duplicated, and sorted.
 * - Classification list mirrors apsClassificationEnum values (APS1–APS6, EL1, EL2, SES)
 *   from the schema for consistency.
 * - Uses Shadcn Select import pattern consistent with existing code (see BlogSearch). :contentReference[oaicite:0]{index=0}
 * - SelectJobPick type is imported from "@/types" per project type exports. :contentReference[oaicite:1]{index=1}
 *
 * Assumptions:
 * - Parent page fetches data server-side and passes the full list down.
 * - No persistence required; filters reset on page reload.
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import type { SelectJobPick } from "@/types"

/**
 * APS classification options, aligned to apsClassificationEnum in the schema. :contentReference[oaicite:2]{index=2}
 */
const CLASSIFICATION_OPTIONS = [
  "APS1",
  "APS2",
  "APS3",
  "APS4",
  "APS5",
  "APS6",
  "EL1",
  "EL2",
  "SES"
] as const

type ClassificationValue = (typeof CLASSIFICATION_OPTIONS)[number] | "all"

export interface JobPickFiltersProps {
  picks: SelectJobPick[]
  onChange: (filtered: SelectJobPick[]) => void
  className?: string
}

/**
 * @component JobPickFilters
 * Renders filter controls and emits filtered results when the user changes selection.
 */
export default function JobPickFilters({
  picks,
  onChange,
  className
}: JobPickFiltersProps) {
  const [classification, setClassification] = React.useState<ClassificationValue>("all")
  const [agency, setAgency] = React.useState<string>("all")

  // Build a sorted unique list of agencies from the data.
  const agencies = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of picks) {
      if (p.agency && p.agency.trim()) set.add(p.agency.trim())
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [picks])

  // Apply filters and emit to parent whenever inputs change.
  React.useEffect(() => {
    const filtered = picks.filter(p => {
      const matchesClass =
        classification === "all" ? true : p.classification === classification
      const matchesAgency = agency === "all" ? true : p.agency === agency
      return matchesClass && matchesAgency
    })
    onChange(filtered)
  }, [classification, agency, picks, onChange])

  const hasActiveFilters = classification !== "all" || agency !== "all"
  const disabled = picks.length === 0

  const clearFilters = () => {
    setClassification("all")
    setAgency("all")
  }

  return (
    <div className={`bg-background mb-6 rounded-lg border p-4 ${className || ""}`}>
      {/* Header row */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="size-4" />
        <div className="text-sm font-medium">Filter job picks</div>
        
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Classification */}
        <div className="flex-1">
          <Select
            value={classification}
            onValueChange={v => setClassification(v as ClassificationValue)}
            disabled={disabled}
          >
            <SelectTrigger aria-label="Filter by APS classification">
              <SelectValue placeholder="Filter by classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classifications</SelectItem>
              {CLASSIFICATION_OPTIONS.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agency */}
        <div className="flex-1">
          <Select
            value={agency}
            onValueChange={v => setAgency(v)}
            disabled={disabled}
          >
            <SelectTrigger aria-label="Filter by agency">
              <SelectValue placeholder="Filter by agency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agencies</SelectItem>
              {agencies.map(a => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear */}
        <div className="sm:ml-auto">
          <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
            <X className="mr-2 size-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}