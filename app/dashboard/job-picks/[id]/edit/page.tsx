/**
 * @file app/dashboard/job-picks/[id]/edit/page.tsx
 * @description
 * Admin edit page for APS "Job Picks".
 * - Gated by requireAdmin()
 * - Loads a job pick by ID and pre-fills a form
 * - Updates record with Zod validation and closing-date temporal check
 * - Includes Publish / Archive / Delete server actions
 * - Revalidates both admin list and public page after mutations
 *
 * Inputs:
 * - params.id: UUID of the job pick to edit
 * - searchParams: optional flags (?updated=1|status=published|archived|error=msg)
 *
 * Notes:
 * - Reuses jobPickFormSchema + assertClosingDateNotPast + toNewJobPickInput
 * - Uses existing CRUD actions from actions/db/job-picks-actions
 * - Uses ClassificationSelect client helper
 */

"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/authz"
import {
  jobPickFormSchema,
  assertClosingDateNotPast,
  toNewJobPickInput,
  APS_CLASSIFICATIONS
} from "@/lib/validators/job-picks"
import {
  getJobPickByIdAction,
  updateJobPickAction,
  publishJobPickAction,
  archiveJobPickAction,
  deleteJobPickAction
} from "@/actions/db/job-picks-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import ClassificationSelect from "../../_components/classification-select"
import { Save, ArrowLeft, Upload, Archive as ArchiveIcon, Trash2 } from "lucide-react"

/**
 * UUID validator for server-side form actions.
 */
const uuidSchema = z.string().uuid()

/**
 * Format a date-like value to "YYYY-MM-DD" for <input type="date" />.
 * Returns empty string when invalid to avoid uncontrolled warnings.
 */
function toInputDate(value?: Date | string | null): string {
  if (!value) return ""
  const d = typeof value === "string" ? new Date(value) : value
  if (isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Map status to Badge styling classes.
 */
function statusBadge(status: "draft" | "published" | "archived") {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800"
    case "archived":
      return "bg-gray-200 text-gray-800"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

/**
 * Server action: Update a job pick.
 * - Validates payload
 * - Applies temporal closing-date check
 * - Uses the same transformer as "create" to keep normalization consistent
 * - Revalidates affected pages
 * - Redirects back to this edit page with ?updated=1 or ?error=...
 */
async function updatePick(formData: FormData) {
  "use server"
  await requireAdmin()

  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)

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

  const parsed = jobPickFormSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid form input"
    redirect(`/dashboard/job-picks/${id}/edit?error=${encodeURIComponent(msg)}`)
  }

  try {
    assertClosingDateNotPast(parsed.data)
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || "Closing date error"
    redirect(`/dashboard/job-picks/${id}/edit?error=${encodeURIComponent(msg)}`)
  }

  const payload = toNewJobPickInput(parsed.data)

  const res = await updateJobPickAction(id, payload)
  if (!res.isSuccess) {
    redirect(`/dashboard/job-picks/${id}/edit?error=${encodeURIComponent(res.message)}`)
  }

  // Refresh admin list and public page
  revalidatePath("/dashboard/job-picks")
  revalidatePath("/job-picks")

  redirect(`/dashboard/job-picks/${id}/edit?updated=1`)
}

/**
 * Server action: Publish a job pick.
 */
async function publishPick(formData: FormData) {
  "use server"
  await requireAdmin()
  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)
  await publishJobPickAction(id)
  revalidatePath("/dashboard/job-picks")
  revalidatePath("/job-picks")
  redirect(`/dashboard/job-picks/${id}/edit?status=published`)
}

/**
 * Server action: Archive a job pick.
 */
async function archivePick(formData: FormData) {
  "use server"
  await requireAdmin()
  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)
  await archiveJobPickAction(id)
  revalidatePath("/dashboard/job-picks")
  revalidatePath("/job-picks")
  redirect(`/dashboard/job-picks/${id}/edit?status=archived`)
}

/**
 * Server action: Delete a job pick (hard delete).
 */
async function deletePick(formData: FormData) {
  "use server"
  await requireAdmin()
  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)
  await deleteJobPickAction(id)
  revalidatePath("/dashboard/job-picks")
  revalidatePath("/job-picks")
  redirect(`/dashboard/job-picks?deleted=1`)
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string; status?: string; error?: string }>
}

/**
 * Admin Edit Page
 */
export default async function EditJobPickPage({ params, searchParams }: PageProps) {
  await requireAdmin()

  const { id } = await params
  uuidSchema.parse(id)

  const sp = await searchParams
  const updated = sp?.updated === "1"
  const statusMsg = sp?.status
  const errorMsg = sp?.error

  const res = await getJobPickByIdAction(id)
  if (!res.isSuccess || !res.data) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTitle>Not found</AlertTitle>
          <AlertDescription>{res.message || "Job Pick not found."}</AlertDescription>
        </Alert>

        <div>
          <Button variant="outline" asChild>
            <a href="/dashboard/job-picks">
              <ArrowLeft className="mr-2 size-4" />
              Back to list
            </a>
          </Button>
        </div>
      </div>
    )
  }

  const pick = res.data
  const closingDefault = toInputDate(pick.closingDate)

  return (
    <div className="space-y-6">
      {updated && (
        <Alert>
          <AlertTitle>Updated</AlertTitle>
          <AlertDescription>Job Pick saved successfully.</AlertDescription>
        </Alert>
      )}
      {statusMsg && (
        <Alert>
          <AlertTitle>Status changed</AlertTitle>
          <AlertDescription>
            {statusMsg === "published" ? "Published" : statusMsg === "archived" ? "Archived" : statusMsg}
          </AlertDescription>
        </Alert>
      )}
      {errorMsg && (
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edit Job Pick</h2>
          <div className="text-sm text-muted-foreground">
            {pick.title} — <span className="font-medium">{pick.agency}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusBadge(pick.status)}>{pick.status}</Badge>

          {pick.status !== "published" && (
            <form action={publishPick}>
              <input type="hidden" name="id" value={pick.id} />
              <Button size="sm">
                <Upload className="mr-1 size-4" />
                Publish
              </Button>
            </form>
          )}

          {pick.status === "published" && (
            <form action={archivePick}>
              <input type="hidden" name="id" value={pick.id} />
              <Button variant="outline" size="sm">
                <ArchiveIcon className="mr-1 size-4" />
                Archive
              </Button>
            </form>
          )}

          <form action={deletePick}>
            <input type="hidden" name="id" value={pick.id} />
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-1 size-4" />
              Delete
            </Button>
          </form>

          <Button variant="outline" asChild>
            <a href="/dashboard/job-picks">
              <ArrowLeft className="mr-2 size-4" />
              Back to list
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={updatePick} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input type="hidden" name="id" value={pick.id} />

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" name="title" defaultValue={pick.title || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">Agency</Label>
              <Input id="agency" name="agency" defaultValue={pick.agency || ""} required />
            </div>

            <div className="space-y-2">
              <Label>Classification</Label>
              <ClassificationSelect
                name="classification"
                options={[...APS_CLASSIFICATIONS]}
                defaultValue={pick.classification}
                placeholder="Select APS classification"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input id="salary" name="salary" defaultValue={pick.salary || ""} placeholder="e.g. A$82k–$96k" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" name="location" defaultValue={pick.location || ""} placeholder="e.g. Canberra, ACT" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDate">Closing date (optional)</Label>
              <Input id="closingDate" name="closingDate" type="date" defaultValue={closingDefault} />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="apsJobsUrl">APS Jobs URL</Label>
              <Input
                id="apsJobsUrl"
                name="apsJobsUrl"
                type="url"
                defaultValue={pick.apsJobsUrl || ""}
                placeholder="https://www.apsjobs.gov.au/some/job/path"
                required
              />
              <p className="text-xs text-muted-foreground">Must be an APS Jobs link (apsjobs.gov.au).</p>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="highlightNote">Highlight note (optional)</Label>
              <Textarea
                id="highlightNote"
                name="highlightNote"
                defaultValue={pick.highlightNote || ""}
                placeholder="Why this role is notable, target audience, impact, etc."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthTag">Month tag</Label>
              <Input
                id="monthTag"
                name="monthTag"
                defaultValue={pick.monthTag || ""}
                placeholder="YYYY-MM"
                required
              />
              <p className="text-xs text-muted-foreground">Used for grouping and SEO (e.g., 2025-08).</p>
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3">
              <Button type="submit">
                <Save className="mr-2 size-4" />
                Update
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}