/**
 * @file app/(marketing)/job-picks/_components/job-picks-split-browser.tsx
 * @description
 * Split-view client component that renders a left panel with job cards
 * and a right panel with detailed job view. Manages selection state.
 * Filtering is now handled at the parent level for a cleaner interface.
 * 
 * Layout:
 * - Left panel: List of compact job cards
 * - Right panel: Detailed view of selected job
 * - Responsive: stacks on mobile, side-by-side on desktop
 */

"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type { SelectJobPick } from "@/types"
import JobPickCardCompact from "@/components/job-picks/job-pick-card-compact"
import JobPickDetailView from "@/components/job-picks/job-pick-detail-view"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface JobPicksSplitBrowserProps {
  picks: SelectJobPick[]
}

export default function JobPicksSplitBrowser({ picks }: JobPicksSplitBrowserProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(() => {
    // Initialize from URL search params if valid job ID exists
    const jobId = searchParams?.get('job')
    return jobId && picks.some(p => p.id === jobId) ? jobId : null
  })
  const [showMobileDetail, setShowMobileDetail] = React.useState(() => {
    // Show mobile detail if we have a selected job from URL
    const jobId = searchParams?.get('job')
    return jobId && picks.some(p => p.id === jobId)
  })

  const updateURLWithJobId = React.useCallback((jobId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '')
    if (jobId) {
      newSearchParams.set('job', jobId)
    } else {
      newSearchParams.delete('job')
    }
    const newURL = `${pathname}?${newSearchParams.toString()}`
    router.replace(newURL, { scroll: false })
  }, [searchParams, pathname, router])

  const handleJobSelect = React.useCallback((jobId: string) => {
    setSelectedJobId(jobId)
    setShowMobileDetail(true)
    updateURLWithJobId(jobId)
  }, [updateURLWithJobId])

  const handleBackToList = React.useCallback(() => {
    setShowMobileDetail(false)
    // Don't clear the URL on mobile back, just hide the detail view
  }, [])

  const selectedJob = React.useMemo(
    () => selectedJobId ? picks.find((p) => p.id === selectedJobId) || null : null,
    [picks, selectedJobId]
  )

  // Effect to handle URL changes and validate job ID on mount/picks change
  React.useEffect(() => {
    const jobId = searchParams?.get('job')
    if (jobId && picks.length > 0) {
      const jobExists = picks.some(p => p.id === jobId)
      if (jobExists && jobId !== selectedJobId) {
        setSelectedJobId(jobId)
        setShowMobileDetail(true)
      } else if (!jobExists && selectedJobId === jobId) {
        // Job ID in URL doesn't exist in current picks, clear selection
        setSelectedJobId(null)
        setShowMobileDetail(false)
        updateURLWithJobId(null)
      }
    }
  }, [searchParams, picks, selectedJobId, updateURLWithJobId])

  const total = picks.length

  return (
    <div className="h-[800px] rounded-lg overflow-hidden bg-background">
      {/* Mobile view */}
      <div className="block lg:hidden h-full">
        {!showMobileDetail ? (
          // Mobile list view
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4">
                {total === 0 ? (
                  <div className="text-muted-foreground rounded-md bg-gray-50 p-6 text-center text-sm">
                    No roles in this group.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {picks.map((pick) => (
                      <JobPickCardCompact
                        key={pick.id}
                        {...pick}
                        isSelected={pick.id === selectedJobId}
                        onClick={() => handleJobSelect(pick.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Mobile detail view
          <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-white/50 shrink-0">
              <button
                onClick={handleBackToList}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to jobs
              </button>
            </div>
            <div className="flex-1">
              <JobPickDetailView job={selectedJob} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden lg:flex h-full">
        {/* Left panel */}
        <div className="w-1/2 bg-white/30 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4">
              {total === 0 ? (
                <div className="text-muted-foreground rounded-md bg-gray-50 p-6 text-center text-sm">
                  No roles in this group.
                </div>
              ) : (
                <div className="space-y-3">
                  {picks.map((pick) => (
                    <JobPickCardCompact
                      key={pick.id}
                      {...pick}
                      isSelected={pick.id === selectedJobId}
                      onClick={() => handleJobSelect(pick.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel */}
        <div className="w-1/2 border-l border-gray-100">
          <JobPickDetailView job={selectedJob} />
        </div>
      </div>
    </div>
  )
} 