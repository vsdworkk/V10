/**
 * @file app/dashboard/job-picks/page.tsx
 * @description
 * Admin list page for managing APS "Job Picks".
 * - Gated by requireAdmin()
 * - Lists all job picks with status and metadata
 * - Inline actions: Publish, Archive, Delete
 *
 * Data:
 * - Uses listJobPicksAdminAction() to fetch rows, ordered by updatedAt DESC.
 *
 * Caching:
 * - Mutations revalidate this route via revalidatePath("/dashboard/job-picks")
 */

"use server"

import Link from "next/link"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/authz"
import {
  listJobPicksAdminAction,
  publishJobPickAction,
  archiveJobPickAction,
  deleteJobPickAction
} from "@/actions/db/job-picks-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, Edit2, Upload, Archive as ArchiveIcon, Trash2 } from "lucide-react"

/**
 * Validate UUID server-side for action payloads.
 */
const uuidSchema = z.string().uuid()

/**
 * Publish server action wrapper.
 */
async function publishPick(formData: FormData) {
  "use server"
  await requireAdmin()
  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)
  await publishJobPickAction(id)
  revalidatePath("/dashboard/job-picks")
}

/**
 * Archive server action wrapper.
 */
async function archivePick(formData: FormData) {
  "use server"
  await requireAdmin()
  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)
  await archiveJobPickAction(id)
  revalidatePath("/dashboard/job-picks")
}

/**
 * Delete server action wrapper.
 * Hard delete, irreversible.
 */
async function deletePick(formData: FormData) {
  "use server"
  await requireAdmin()
  const id = String(formData.get("id") || "")
  uuidSchema.parse(id)
  await deleteJobPickAction(id)
  revalidatePath("/dashboard/job-picks")
}

/**
 * Format date for AU-friendly display.
 */
function fmt(date?: Date | string | null) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
}

/**
 * Status -> Badge style mapping.
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

interface PageProps {
  searchParams: Promise<{ created?: string; error?: string }>
}

export default async function JobPicksAdminPage({ searchParams }: PageProps) {
  // Gate with admin allowlist
  await requireAdmin() // Provided by lib/authz.ts; redirects if not admin. :contentReference[oaicite:4]{index=4}

  const sp = await searchParams
  const created = sp?.created === "1"
  const errorMsg = sp?.error

  // Fetch rows for admin table
  const listRes = await listJobPicksAdminAction() // Admin list action already implemented. :contentReference[oaicite:5]{index=5}
  const rows = listRes.isSuccess ? listRes.data : []

  return (
    <div className="space-y-6">
      {created && (
        <Alert>
          <AlertTitle>Created</AlertTitle>
          <AlertDescription>Job Pick was created successfully.</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {!listRes.isSuccess && (
        <Alert>
          <AlertTitle>Failed to load</AlertTitle>
          <AlertDescription>{listRes.message || "Unable to load job picks."}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Job Picks</h2>
          <div className="text-sm text-muted-foreground">Add, publish, archive, or delete curated listings.</div>
        </div>

        <Button asChild>
          <Link href="/dashboard/job-picks/new">
            <Plus className="mr-2 size-4" /> New Job Pick
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Job Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Closing</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-muted-foreground">
                      No job picks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell>{r.agency}</TableCell>
                      <TableCell>{r.classification}</TableCell>
                      <TableCell>{r.salary || "—"}</TableCell>
                      <TableCell>{r.location || "—"}</TableCell>
                      <TableCell>{fmt(r.closingDate)}</TableCell>
                      <TableCell>{r.monthTag}</TableCell>
                      <TableCell>
                        <Badge className={statusBadge(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell>{fmt(r.updatedAt)}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/dashboard/job-picks/${r.id}/edit`}>
                            <Edit2 className="mr-1 size-4" />
                            Edit
                          </Link>
                        </Button>

                        {r.status !== "published" && (
                          <form action={publishPick} className="inline">
                            <input type="hidden" name="id" value={r.id} />
                            <Button variant="default" size="sm">
                              <Upload className="mr-1 size-4" />
                              Publish
                            </Button>
                          </form>
                        )}

                        {r.status === "published" && (
                          <form action={archivePick} className="inline">
                            <input type="hidden" name="id" value={r.id} />
                            <Button variant="outline" size="sm">
                              <ArchiveIcon className="mr-1 size-4" />
                              Archive
                            </Button>
                          </form>
                        )}

                        <form action={deletePick} className="inline">
                          <input type="hidden" name="id" value={r.id} />
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-1 size-4" />
                            Delete
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}