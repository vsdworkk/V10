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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Filter, X, Search } from "lucide-react"
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
  const [searchText, setSearchText] = React.useState<string>("")

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
      
      // Text search across multiple fields
      const matchesText = searchText.trim() === "" ? true : 
        [p.title, p.agency, p.highlightNote, p.salary, p.location]
          .filter(Boolean)
          .some(field => 
            field?.toLowerCase().includes(searchText.toLowerCase())
          )
      
      return matchesClass && matchesAgency && matchesText
    })
    onChange(filtered)
  }, [classification, agency, searchText, picks, onChange])

  const hasActiveFilters = classification !== "all" || agency !== "all" || searchText.trim() !== ""
  const disabled = picks.length === 0

  const clearFilters = () => {
    setClassification("all")
    setAgency("all")
    setSearchText("")
  }

  return (
    <div className={`bg-transparent p-6 ${className || ""}`}>
      {/* Controls - search bar style layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-center max-w-5xl mx-auto">
        {/* Text Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Jobs"
              disabled={disabled}
              className="h-12 pl-10 text-base border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
            />
          </div>
        </div>

        {/* Classification */}
        <div className="flex-1 max-w-xs">
          <Select
            value={classification}
            onValueChange={v => setClassification(v as ClassificationValue)}
            disabled={disabled}
          >
            <SelectTrigger 
              aria-label="Filter by APS classification"
              className="h-12 text-base border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
              <SelectValue placeholder="Job classification" />
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
        <div className="flex-1 max-w-xs">
          <Select
            value={agency}
            onValueChange={v => setAgency(v)}
            disabled={disabled}
          >
            <SelectTrigger 
              aria-label="Filter by agency"
              className="h-12 text-base border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
              <SelectValue placeholder="Agency or department" />
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

        {/* Clear button - styled like a search button */}
        <div className="sm:ml-4">
          <Button 
            type="button" 
            variant={hasActiveFilters ? "outline" : "ghost"} 
            onClick={clearFilters} 
            disabled={!hasActiveFilters}
            className="h-12 px-6 text-base border-gray-200 hover:border-gray-300 shadow-sm"
          >
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>
      </div>
    </div>
  )
}