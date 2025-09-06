/**
 * @file app/(marketing)/job-picks/page.tsx
 * @description Public SSR page that lists curated APS Job Picks, grouped by monthTag.
 * Fetches published picks via server action, renders filters and a responsive grid.
 * Uses ISR (revalidate = 3600) for SEO and freshness.
 *
 * Key features:
 * - Server-side fetch using getPublicJobPicksAction (published + open/undated) :contentReference[oaicite:0]{index=0}
 * - Groups results by monthTag and shows latest months first
 * - Client-side filtering via a client wrapper while reusing the server JobPickCard by passing as children :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}
 * - Page metadata for SEO
 *
 * Assumptions:
 * - actions/db/job-picks-actions.ts exists and exports getPublicJobPicksAction :contentReference[oaicite:3]{index=3}
 * - components/job-picks/job-pick-card.tsx exists and is a server component :contentReference[oaicite:4]{index=4}
 * - components/job-picks/job-pick-filters.tsx exists and is a client component used by the wrapper :contentReference[oaicite:5]{index=5}
 *
 * Error handling:
 * - Graceful empty state if no picks are returned
 * - Fallback UI during loading via Suspense
 */

import { Suspense } from "react"
import type { Metadata } from "next"
import { getPublicJobPicksAction } from "@/actions/db/job-picks-actions"
import type { SelectJobPick } from "@/types"
import JobPicksSplitBrowser from "@/app/(marketing)/job-picks/_components/job-picks-split-browser"
import JobPicksWithFilters from "@/app/(marketing)/job-picks/_components/job-picks-with-filters"

/**
 * ISR: revalidate once per hour to keep listings fresh.
 */
export const revalidate = 3600

/**
 * Page metadata for SEO.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "APS Job Picks — Curated roles | APSPitchPro",
    description:
      "Monthly curated APS roles with key details and direct links. Browse picks and generate your APS pitch in minutes.",
    alternates: { canonical: "/job-picks" }
  }
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

/**
 * Async section that fetches and renders grouped job picks with client filters.
 */
async function JobPicksFetcher() {
  const res = await getPublicJobPicksAction()
  if (!res.isSuccess) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center text-sm text-red-600">
          Failed to load job picks.
        </div>
      </div>
    )
  }

  const picks = res.data || []
  if (picks.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-3xl font-bold">APS Job Picks</div>

          <div className="text-muted-foreground mt-3">
            No published roles available right now. Check back soon.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="text-3xl font-bold">APS Job Picks</div>

        <div className="text-muted-foreground mt-3">
          Handpicked APS roles with key details and direct APS Jobs links.
          Generate a tailored APS pitch in minutes.
        </div>
      </div>

      {/* Global search/filter bar positioned under header */}
      <JobPicksWithFilters picks={picks} />
    </div>
  )
}

/**
 * Public page entry. Suspense shows a lightweight fallback while fetching.
 */
export default async function JobPicksPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-12">
          <div className="mx-auto max-w-2xl animate-pulse text-center">
            <div className="bg-muted mx-auto mb-2 h-7 w-64 rounded" />
            <div className="bg-muted mx-auto h-4 w-80 rounded" />
          </div>
        </div>
      }
    >
      <JobPicksFetcher />
    </Suspense>
  )
}
