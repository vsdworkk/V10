/**
 * @file lib/validators/job-picks.ts
 * @description
 * Zod validation and helper transforms for APS "Job Picks" admin forms.
 *
 * Responsibilities:
 * - Define strict schema for creating/updating job picks.
 * - Enforce APS Jobs URL host allowlist.
 * - Basic temporal validation for closing dates.
 * - Provide helpers to convert validated values into DB-friendly payloads.
 *
 * Notes:
 * - Month tag must be in YYYY-MM format.
 * - Closing date may be omitted; if provided it must be today or later.
 * - We do not set userId here; the server action enforces and overwrites it.
 */

import { z } from "zod"
import type { InsertJobPick } from "@/types"

/**
 * Allowed APS classification values.
 * Keep in sync with db/schema/job-picks-schema.ts classificationEnum.
 */
export const APS_CLASSIFICATIONS = [
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

export type APSClassification = (typeof APS_CLASSIFICATIONS)[number]

/**
 * Host allowlist for APS Jobs links.
 * Accept common host variants for safety.
 */
const APS_JOBS_HOSTS = new Set([
  "www.apsjobs.gov.au",
  "apsjobs.gov.au"
])

/**
 * Returns true if the URL is on an allowed APS Jobs host.
 */
function isAllowedApsJobsUrl(u: string): boolean {
  try {
    const url = new URL(u)
    const host = (url.hostname || "").toLowerCase()
    if (APS_JOBS_HOSTS.has(host)) return true
    // Allow subdomains under apsjobs.gov.au if they arise
    if (host.endsWith(".apsjobs.gov.au")) return true
    return false
  } catch {
    return false
  }
}

/**
 * Schema for the admin "Create Job Pick" form.
 *
 * String fields allow empty string, which will be coerced to undefined later.
 */
export const jobPickFormSchema = z.object({
  title: z.string().min(3, "Title is required").max(200, "Title too long"),
  agency: z.string().min(2, "Agency is required").max(200, "Agency too long"),
  classification: z.enum(APS_CLASSIFICATIONS, {
    errorMap: () => ({ message: "Select a valid APS classification" })
  }),
  salary: z
    .string()
    .max(120, "Salary too long")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(160, "Location too long")
    .optional()
    .or(z.literal("")),
  // Accepts "YYYY-MM-DD". Optional.
  closingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use date format YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  apsJobsUrl: z
    .string()
    .url("Enter a valid URL")
    .refine(isAllowedApsJobsUrl, "URL must be an APS Jobs link (apsjobs.gov.au)"),
  highlightNote: z
    .string()
    .max(10000, "Highlight note too long")
    .optional()
    .or(z.literal("")),
  // YYYY-MM for grouping and SEO (e.g., 2025-08)
  monthTag: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format")
})

export type JobPickFormValues = z.infer<typeof jobPickFormSchema>

/**
 * Coerce blank optional strings to undefined.
 */
function emptyToUndef<T extends Record<string, unknown>>(obj: T): T {
  const next = { ...obj }
  for (const [k, v] of Object.entries(next)) {
    if (typeof v === "string" && v.trim() === "") {
      ;(next as any)[k] = undefined
    }
  }
  return next
}

/**
 * Validate that a closing date, if supplied, is today or later.
 * Throws ZodError-compatible error on failure.
 */
export function assertClosingDateNotPast(values: JobPickFormValues): void {
  if (!values.closingDate || values.closingDate.trim() === "") return
  const today = new Date()
  // Normalize to date-only comparison using local timezone.
  const [y, m, d] = values.closingDate.split("-").map(Number)
  const input = new Date(y, (m as number) - 1, d)
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (input < todayOnly) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Closing date cannot be in the past",
        path: ["closingDate"]
      }
    ])
  }
}

/**
 * Convert validated form values to a DB insert payload (without userId).
 * - Converts closingDate string to Date.
 * - Omits status so DB default applies ("draft").
 */
export type NewJobPickInput = Omit<
  InsertJobPick,
  "userId" | "id" | "status" | "createdAt" | "updatedAt"
>

export function toNewJobPickInput(values: JobPickFormValues): NewJobPickInput {
  const v = emptyToUndef(values)

  let closingDate: Date | undefined
  if (typeof v.closingDate === "string" && v.closingDate) {
    const [yy, mm, dd] = v.closingDate.split("-").map(Number)
    closingDate = new Date(yy, (mm as number) - 1, dd)
  }

  return {
    title: v.title,
    agency: v.agency,
    classification: v.classification,
    salary: (v.salary as string | undefined) || undefined,
    location: (v.location as string | undefined) || undefined,
    closingDate,
    apsJobsUrl: v.apsJobsUrl,
    highlightNote: (v.highlightNote as string | undefined) || undefined,
    monthTag: v.monthTag
  }
}