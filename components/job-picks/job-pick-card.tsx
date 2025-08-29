/**
 * @file components/job-picks/job-pick-card.tsx
 * @description
 * Server component that renders a single curated APS Job Pick in a marketing-friendly card.
 * Shows role title, agency, APS classification, salary, location, closing date, and a short highlight note.
 * Includes two CTAs:
 *  - "Apply on APS Jobs" (external) with UTM tracking appended.
 *  - "Generate your Pitch" (internal) linking to the wizard with prefill query params.
 *
 * Key features:
 * - Accepts DB-inferred type `SelectJobPick` directly as props for simple spread usage: <JobPickCard {...pick} />
 * - Uses Shadcn Card, Button, Badge components for consistent styling.
 * - Uses lucide-react icons per project rules.
 * - Formats `closingDate` on the server for SSR.
 *
 * Edge cases:
 * - Any of salary, location, closingDate, or highlightNote may be undefined; UI degrades gracefully.
 * - If `apsJobsUrl` is malformed, falls back to the raw href without UTM changes.
 * - Only passes `roleLevel` to the wizard when classification is one of the allowed values ("APS1"..."APS6","EL1").
 *
 * Assumptions:
 * - `SelectJobPick` includes: id, title, agency, classification, salary, location, closingDate,
 *   apsJobsUrl, highlightNote, monthTag, status, userId, createdAt, updatedAt (per Step 2 and 3).
 * - No dependence on client-side state; purely SSR-friendly.
 */

import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Building2, MapPin, CalendarDays, ExternalLink, Wand2 } from "lucide-react"
import type { SelectJobPick } from "@/types"

/**
 * Safely formats a date value to a human-readable AU-style date.
 * @param date A Date or date-like value
 * @returns A formatted date string like "28 Aug 2025", or "—" if not parseable.
 */
function formatAUSDate(date?: Date | string | null): string {
  if (!date) return "—"
  try {
    const d = typeof date === "string" ? new Date(date) : date
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  } catch {
    return "—"
  }
}

/**
 * Safely appends UTM parameters to a URL.
 */
function withUTM(href: string, utm: Record<string, string>): string {
  try {
    const url = new URL(href)
    Object.entries(utm).forEach(([key, value]) => url.searchParams.set(key, value))
    return url.toString()
  } catch {
    return href
  }
}

/**
 * JobPickCard component.
 * Accepts the job pick row as the prop object to allow spread usage in maps: <JobPickCard {...pick} />
 */
export default async function JobPickCard(pick: SelectJobPick) {
  // Prepare external URL with UTM tracking
  const apsHref = withUTM(pick.apsJobsUrl, {
    utm_source: "apspitchpro",
    utm_medium: "job_picks",
    utm_campaign: pick.monthTag || "monthly_job_picks",
    utm_content: pick.title || "role"
  })

  // Internal dashboard CTA (changed from wizard)
  const { userId } = await auth()
  const targetHref = userId
    ? "/dashboard"
    : `/login?redirect_url=${encodeURIComponent("/dashboard")}`

  return (
    <Card className="h-full overflow-hidden">
      {/* Header: Title / Agency */}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{pick.title}</CardTitle>

          <Badge variant="secondary" className="shrink-0">
            {pick.classification}
          </Badge>
        </div>

        <CardDescription className="flex items-center gap-2">
          <Building2 className="size-4" />
          <div className="truncate">{pick.agency}</div>
        </CardDescription>
      </CardHeader>

      {/* Content: Quick facts */}
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <div className="text-sm">
              <div className="text-muted-foreground">Location</div>
              <div className="font-medium">{pick.location || "—"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            <div className="text-sm">
              <div className="text-muted-foreground">Closing date</div>
              <div className="font-medium">
                {formatAUSDate(pick.closingDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Using Building2 again as a neutral salary icon to keep icon set small */}
            <Building2 className="size-4" />
            <div className="text-sm">
              <div className="text-muted-foreground">Salary</div>
              <div className="font-medium">{pick.salary || "—"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Month tag acts as a coarse grouping hint for the public page */}
            <CalendarDays className="size-4" />
            <div className="text-sm">
              <div className="text-muted-foreground">Month</div>
              <div className="font-medium">{pick.monthTag}</div>
            </div>
          </div>
        </div>

        {pick.highlightNote && (
          <div className="rounded-md border p-3 text-sm">
            <div className="text-muted-foreground mb-1">About this role</div>
            <div>{pick.highlightNote}</div>
          </div>
        )}
      </CardContent>

      {/* Footer: CTAs */}
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a
            href={apsHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Apply on APS Jobs"
          >
            <ExternalLink className="mr-2 size-4" />
            Apply on APS Jobs
          </a>
        </Button>

        <Button asChild className="w-full sm:w-auto">
          <Link href={targetHref} aria-label="Generate your pitch for this role">
            <Wand2 className="mr-2 size-4" />
            Generate your Pitch
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}