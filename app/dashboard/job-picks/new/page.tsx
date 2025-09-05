/**
 * @file app/dashboard/job-picks/new/page.tsx
 * @description
 * Admin create page for APS "Job Picks".
 * - Gated by requireAdmin()
 * - Server action validates with Zod and creates a new job pick
 * - Redirects back to list on success
 *
 * Edge cases:
 * - Invalid input: redirects back with error in search params
 * - DB failure: redirects back with server error message
 */

"use server"

import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/authz"
import {
  jobPickFormSchema,
  assertClosingDateNotPast,
  toNewJobPickInput,
  APS_CLASSIFICATIONS
} from "@/lib/validators/job-picks"
import { createJobPickAction } from "@/actions/db/job-picks-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import ClassificationSelect from "../_components/classification-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

/**
 * Server action to create a new Job Pick.
 * - Requires admin
 * - Validates form payload
 * - Calls createJobPickAction with userId override
 */
async function createPick(formData: FormData) {
  "use server"
  const userId = await requireAdmin() // Will redirect non-admins. :contentReference[oaicite:6]{index=6}

  // Collect raw values as strings for validation
  const raw = {
    title: String(formData.get("title") || ""),
    agency: String(formData.get("agency") || ""),
    classification: String(formData.get("classification") || ""),
    salary: String(formData.get("salary") || ""),
    location: String(formData.get("location") || ""),
    closingDate: String(formData.get("closingDate") || ""),
    apsJobsUrl: String(formData.get("apsJobsUrl") || ""),
    highlightNote: String(formData.get("highlightNote") || ""),
    monthTag: String(formData.get("monthTag") || "")
  }

  // Zod validation
  const parsed = jobPickFormSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid form input"
    redirect(`/dashboard/job-picks/new?error=${encodeURIComponent(msg)}`)
  }
  // Temporal check for closing date
  try {
    assertClosingDateNotPast(parsed.data)
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || "Closing date error"
    redirect(`/dashboard/job-picks/new?error=${encodeURIComponent(msg)}`)
  }

  // Transform to DB payload and call action
  const payload = toNewJobPickInput(parsed.data)
  const res = await createJobPickAction({ ...payload, userId }) // Action overwrites userId anyway. :contentReference[oaicite:7]{index=7}

  if (!res.isSuccess) {
    redirect(
      `/dashboard/job-picks/new?error=${encodeURIComponent(res.message)}`
    )
  }

  // Success
  redirect("/dashboard/job-picks?created=1")
}

export default async function NewJobPickPage({ searchParams }: PageProps) {
  await requireAdmin()

  const sp = await searchParams
  const errorMsg = sp?.error

  // Default monthTag to current month
  const now = new Date()
  const defaultMonthTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">New Job Pick</h2>
          <div className="text-muted-foreground text-sm">
            Add a curated APS job listing.
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link href="/dashboard/job-picks">
            <ArrowLeft className="mr-2 size-4" />
            Back to list
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createPick}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label htmlFor="title">Job title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Policy Officer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">Agency</Label>
              <Input
                id="agency"
                name="agency"
                placeholder="e.g., Department of Finance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Classification</Label>
              <ClassificationSelect
                name="classification"
                options={[...APS_CLASSIFICATIONS]}
                placeholder="Select APS classification"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input id="salary" name="salary" placeholder="e.g., A$82k–$96k" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Canberra, ACT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing date (optional)</Label>
              <Input id="closingDate" name="closingDate" type="date" />
            </div>

            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label htmlFor="apsJobsUrl">APS Jobs URL</Label>
              <Input
                id="apsJobsUrl"
                name="apsJobsUrl"
                type="url"
                placeholder="https://www.apsjobs.gov.au/some/job/path"
                required
              />
              <p className="text-muted-foreground text-xs">
                Must be an APS Jobs link (apsjobs.gov.au).
              </p>
            </div>

            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label htmlFor="highlightNote">Highlight note (optional)</Label>
              <Textarea
                id="highlightNote"
                name="highlightNote"
                placeholder="Why this role is notable, target audience, impact, etc."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthTag">Month tag</Label>
              <Input
                id="monthTag"
                name="monthTag"
                placeholder="YYYY-MM"
                defaultValue={defaultMonthTag}
                required
              />
              <p className="text-muted-foreground text-xs">
                Used for grouping and SEO. Example: {defaultMonthTag}
              </p>
            </div>

            <div className="col-span-1 flex items-center justify-end gap-3 md:col-span-2">
              <Button type="submit">
                <Save className="mr-2 size-4" />
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
