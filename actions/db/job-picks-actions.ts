/**
 * @file Server actions for APS Job Picks CRUD and reads
 * @description
 * Implements typed server actions for creating, reading, updating, publishing,
 * archiving, and deleting Job Picks. Public read filters to published and open
 * (or undated) listings. Admin actions enforce an ADMIN_EMAILS allowlist.
 *
 * Key features:
 * - ActionState<T> result pattern for all actions
 * - Admin gating for mutations and admin reads
 * - Public read supports optional monthTag and open/undated filter
 * - Defensive handling of userId population on create
 *
 * @notes
 * - Uses Drizzle ORM with Postgres. No migrations generated here.
 * - Reads ADMIN_EMAILS env for allowlist: comma-separated emails.
 * - For public reads: rows with closingDate in the future or NULL are included.
 * - Sorting: public list ordered by closingDate asc, then agency asc.
 */

"use server"

import { db } from "@/db/db"
import { jobPicksTable } from "@/db/schema"
import { ActionState } from "@/types"
import { InsertJobPick, SelectJobPick } from "@/types"
import { and, asc, desc, eq, gte, isNull, or } from "drizzle-orm"
import { auth, currentUser } from "@clerk/nextjs/server"

/**
 * @function parseAdminEmails
 * @returns Set<string> of normalized admin emails
 * @description Parses ADMIN_EMAILS from env into a Set for quick membership checks.
 * Trims whitespace and lowercases values.
 */
function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || ""
  return new Set(
    raw
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * @function getAuthedUser
 * @returns Promise<{ userId: string; email: string }>
 * @description Retrieves the authenticated user's ID and primary email via Clerk.
 * Throws if unauthenticated or no email can be resolved.
 */
async function getAuthedUser(): Promise<{ userId: string; email: string }> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized: No user session found")
  }

  const user = await currentUser()
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user?.primaryEmailAddressId)
      ?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress

  if (!primaryEmail) {
    throw new Error("Unauthorized: No email for current user")
  }

  return { userId, email: primaryEmail.toLowerCase() }
}

/**
 * @function assertAdmin
 * @returns Promise<string> userId of the admin
 * @description Confirms the current user is in the ADMIN_EMAILS allowlist.
 * Throws on failure to prevent mutation by non-admins.
 */
async function assertAdmin(): Promise<string> {
  const { userId, email } = await getAuthedUser()
  const admins = parseAdminEmails()
  if (!admins.has(email)) {
    throw new Error("Forbidden: Admin access required")
  }
  return userId
}

/**
 * @function createJobPickAction
 * @param pick InsertJobPick - new job pick payload (userId ignored and replaced)
 * @returns Promise<ActionState<SelectJobPick>>
 * @description Creates a new Job Pick. Enforces admin access. Overwrites userId with the caller's userId.
 * Edge cases:
 * - If required fields are missing, DB will error and we return an ActionState failure.
 * - Ensure apsJobsUrl is valid at admin form validation layer (Step 12) as well.
 */
export async function createJobPickAction(
  pick: InsertJobPick
): Promise<ActionState<SelectJobPick>> {
  try {
    const userId = await assertAdmin()

    // Overwrite any provided userId with the authenticated admin userId
    const values: InsertJobPick = {
      ...pick,
      userId
    }

    const [created] = await db.insert(jobPicksTable).values(values).returning()

    return {
      isSuccess: true,
      message: "Job pick created successfully",
      data: created
    }
  } catch (error) {
    console.error("Error creating job pick:", error)
    return { isSuccess: false, message: "Failed to create job pick" }
  }
}

/**
 * @function getPublicJobPicksAction
 * @param monthTag string | undefined - optional month tag (e.g., "2025-08")
 * @returns Promise<ActionState<SelectJobPick[]>>
 * @description Public read for Job Picks.
 * Filters:
 * - status = "published"
 * - closingDate >= now for dated rows, OR closingDate IS NULL (undated)
 * - if monthTag provided, additionally filter by it
 * Sort:
 * - closingDate ASC, then agency ASC
 */
export async function getPublicJobPicksAction(
  monthTag?: string
): Promise<ActionState<SelectJobPick[]>> {
  try {
    const now = new Date()

    const whereCore = and(
      eq(jobPicksTable.status, "published"),
      or(isNull(jobPicksTable.closingDate), gte(jobPicksTable.closingDate, now))
    )

    const whereClause = monthTag
      ? and(whereCore, eq(jobPicksTable.monthTag, monthTag))
      : whereCore

    const rows = await db
      .select()
      .from(jobPicksTable)
      .where(whereClause)
      .orderBy(asc(jobPicksTable.closingDate), asc(jobPicksTable.agency))

    return {
      isSuccess: true,
      message: "Public job picks retrieved",
      data: rows
    }
  } catch (error) {
    console.error("Error getting public job picks:", error)
    return { isSuccess: false, message: "Failed to get public job picks" }
  }
}

/**
 * @function listJobPicksAdminAction
 * @returns Promise<ActionState<SelectJobPick[]>>
 * @description Admin list for Job Picks. Returns all existing rows ordered by updatedAt DESC.
 */
export async function listJobPicksAdminAction(): Promise<
  ActionState<SelectJobPick[]>
> {
  try {
    await assertAdmin()

    const rows = await db
      .select()
      .from(jobPicksTable)
      .orderBy(desc(jobPicksTable.updatedAt))

    return {
      isSuccess: true,
      message: "Admin job picks retrieved",
      data: rows
    }
  } catch (error) {
    console.error("Error listing job picks (admin):", error)
    return { isSuccess: false, message: "Failed to list job picks" }
  }
}

/**
 * @function getJobPickByIdAction
 * @param id string - job pick id (uuid)
 * @returns Promise<ActionState<SelectJobPick>>
 * @description Admin read by id. Returns failure if not found.
 */
export async function getJobPickByIdAction(
  id: string
): Promise<ActionState<SelectJobPick>> {
  try {
    await assertAdmin()

    const rows = await db
      .select()
      .from(jobPicksTable)
      .where(eq(jobPicksTable.id, id))

    const row = rows[0]
    if (!row) {
      return { isSuccess: false, message: "Job pick not found" }
    }

    return {
      isSuccess: true,
      message: "Job pick retrieved",
      data: row
    }
  } catch (error) {
    console.error("Error getting job pick by id (admin):", error)
    return { isSuccess: false, message: "Failed to get job pick" }
  }
}

/**
 * @function updateJobPickAction
 * @param id string - job pick id
 * @param data Partial<InsertJobPick> - fields to update (userId ignored)
 * @returns Promise<ActionState<SelectJobPick>>
 * @description Admin update. Ignores any provided userId.
 */
export async function updateJobPickAction(
  id: string,
  data: Partial<InsertJobPick>
): Promise<ActionState<SelectJobPick>> {
  try {
    await assertAdmin()

    // Prevent userId reassignment
    const { userId: _ignoreUserId, ...safeData } = data

    const [updated] = await db
      .update(jobPicksTable)
      .set(safeData)
      .where(eq(jobPicksTable.id, id))
      .returning()

    if (!updated) {
      return { isSuccess: false, message: "Job pick not found" }
    }

    return {
      isSuccess: true,
      message: "Job pick updated",
      data: updated
    }
  } catch (error) {
    console.error("Error updating job pick (admin):", error)
    return { isSuccess: false, message: "Failed to update job pick" }
  }
}

/**
 * @function publishJobPickAction
 * @param id string - job pick id
 * @returns Promise<ActionState<SelectJobPick>>
 * @description Sets status to "published".
 */
export async function publishJobPickAction(
  id: string
): Promise<ActionState<SelectJobPick>> {
  try {
    await assertAdmin()

    const [updated] = await db
      .update(jobPicksTable)
      .set({ status: "published" })
      .where(eq(jobPicksTable.id, id))
      .returning()

    if (!updated) {
      return { isSuccess: false, message: "Job pick not found" }
    }

    return {
      isSuccess: true,
      message: "Job pick published",
      data: updated
    }
  } catch (error) {
    console.error("Error publishing job pick (admin):", error)
    return { isSuccess: false, message: "Failed to publish job pick" }
  }
}

/**
 * @function archiveJobPickAction
 * @param id string - job pick id
 * @returns Promise<ActionState<SelectJobPick>>
 * @description Sets status to "archived".
 */
export async function archiveJobPickAction(
  id: string
): Promise<ActionState<SelectJobPick>> {
  try {
    await assertAdmin()

    const [updated] = await db
      .update(jobPicksTable)
      .set({ status: "archived" })
      .where(eq(jobPicksTable.id, id))
      .returning()

    if (!updated) {
      return { isSuccess: false, message: "Job pick not found" }
    }

    return {
      isSuccess: true,
      message: "Job pick archived",
      data: updated
    }
  } catch (error) {
    console.error("Error archiving job pick (admin):", error)
    return { isSuccess: false, message: "Failed to archive job pick" }
  }
}

/**
 * @function deleteJobPickAction
 * @param id string - job pick id
 * @returns Promise<ActionState<void>>
 * @description Hard delete. Irreversible. Admin only.
 */
export async function deleteJobPickAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await assertAdmin()

    await db.delete(jobPicksTable).where(eq(jobPicksTable.id, id))

    return {
      isSuccess: true,
      message: "Job pick deleted",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting job pick (admin):", error)
    return { isSuccess: false, message: "Failed to delete job pick" }
  }
}