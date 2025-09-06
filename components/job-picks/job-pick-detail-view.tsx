/**
 * @file components/job-picks/job-pick-detail-view.tsx
 * @description
 * Detailed job view component for the right panel of split-view layout.
 * Shows comprehensive job details similar to Indeed's detail view.
 */

"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  MapPin,
  CalendarDays,
  ExternalLink,
  Wand2,
  DollarSign,
  Clock
} from "lucide-react"
import type { SelectJobPick } from "@/types"

/**
 * Safely formats a date value to a human-readable AU-style date.
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
    Object.entries(utm).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    )
    return url.toString()
  } catch {
    return href
  }
}

interface JobPickDetailViewProps {
  job: SelectJobPick | null
}

export default function JobPickDetailView({ job }: JobPickDetailViewProps) {
  const router = useRouter()
  const { userId } = useAuth()

  if (!job) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="space-y-3">
          <div className="text-muted-foreground text-lg font-medium">
            Select a job to view details
          </div>
          <div className="text-muted-foreground text-sm">
            Click on any job card from the left to see the full details here
          </div>
        </div>
      </div>
    )
  }

  // Prepare external URL with UTM tracking
  const apsHref = withUTM(job.apsJobsUrl, {
    utm_source: "apspitchpro",
    utm_medium: "job_picks",
    utm_campaign: job.monthTag || "monthly_job_picks",
    utm_content: job.title || "role"
  })

  // Internal dashboard CTA (changed from wizard)
  const handleGenerate = () => {
    const href = userId
      ? "/dashboard"
      : `/login?redirect_url=${encodeURIComponent("/dashboard")}`
    router.push(href)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold leading-tight">{job.title}</h1>
              <div className="text-muted-foreground flex items-center gap-2">
                <Building2 className="size-4" />
                <span className="text-lg">{job.agency}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {job.classification}
            </Badge>
          </div>

          {/* Quick info row */}
          <div className="flex flex-wrap gap-4 text-sm">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="text-muted-foreground size-4" />
                <span>{job.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="text-muted-foreground size-4" />
              <span>Full-time</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleGenerate} size="lg" className="flex-1">
            <Wand2 className="mr-2 size-4" />
            Generate your Pitch
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
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
        </div>

        <Separator />

        {/* Job details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-muted-foreground size-4" />
                    <span className="font-medium">Salary</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {job.salary || "Not specified"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground size-4" />
                    <span className="font-medium">Closing Date</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {formatAUSDate(job.closingDate)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground size-4" />
                    <span className="font-medium">Location</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {job.location || "Not specified"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground size-4" />
                    <span className="font-medium">Job Type</span>
                  </div>
                  <div className="text-lg font-semibold">Full-time</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-muted-foreground size-4" />
                    <span className="font-medium">Classification</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {job.classification}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlight note */}
          {job.highlightNote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About this role</CardTitle>
                <CardDescription>
                  Our expert insights on what makes this role special
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed">
                  {job.highlightNote}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
