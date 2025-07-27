"use server"

import { z } from "zod"
import { db } from "@/db/db"
import {
  InsertPitch,
  SelectPitch,
  pitchesTable
} from "@/db/schema/pitches-schema"
import { debugLog } from "@/lib/debug"
import { eq, and, desc, or } from "drizzle-orm"
import { ActionState } from "@/types"

/* Zod UUID validator */
const uuidSchema = z.string().uuid()

function validateUUID(id: string): boolean {
  try {
    uuidSchema.parse(id)
    return true
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/*  Create                                                            */
/* ------------------------------------------------------------------ */

export async function createPitchAction(
  pitchData: InsertPitch
): Promise<ActionState<SelectPitch>> {
  try {
    const [newPitch] = await db
      .insert(pitchesTable)
      .values(pitchData)
      .returning()
    return { isSuccess: true, message: "Pitch created", data: newPitch }
  } catch (err) {
    console.error("createPitchAction:", err)
    return { isSuccess: false, message: "Failed to create pitch" }
  }
}

/* ------------------------------------------------------------------ */
/*  Read                                                              */
/* ------------------------------------------------------------------ */

export async function getPitchByIdAction(
  id: string,
  userId: string
): Promise<ActionState<SelectPitch>> {
  if (!validateUUID(id)) {
    return { isSuccess: false, message: "Invalid pitch ID format" }
  }
  try {
    const [pitch] = await db
      .select()
      .from(pitchesTable)
      .where(and(eq(pitchesTable.id, id), eq(pitchesTable.userId, userId)))
      .limit(1)

    return pitch
      ? { isSuccess: true, message: "Pitch found", data: pitch }
      : { isSuccess: false, message: "Pitch not found or not owned by user" }
  } catch (err) {
    console.error("getPitchByIdAction:", err)
    return { isSuccess: false, message: "Failed to fetch pitch" }
  }
}

/** Fetch by PromptLayer execution‑ID (no user context needed). */
export async function getPitchByExecutionIdAction(
  execId: string
): Promise<ActionState<SelectPitch>> {
  if (!execId) {
    return { isSuccess: false, message: "Execution ID must be provided" }
  }
  // Execution ID might not be a UUID, so skipping UUID validation here

  try {
    let [pitch] = await db
      .select()
      .from(pitchesTable)
      .where(eq(pitchesTable.agentExecutionId, execId))
      .limit(1)

    if (!pitch) {
      debugLog(
        `[getPitchByExecutionIdAction] No pitch found with agentExecutionId: ${execId}, trying pitch ID`
      )
      ;[pitch] = await db
        .select()
        .from(pitchesTable)
        .where(eq(pitchesTable.id, execId))
        .limit(1)
    }

    return pitch
      ? { isSuccess: true, message: "Pitch found", data: pitch }
      : {
          isSuccess: false,
          message: "No pitch with that execution‑ID or pitch ID"
        }
  } catch (err) {
    console.error("getPitchByExecutionIdAction:", err)
    return { isSuccess: false, message: "Failed to fetch pitch" }
  }
}

export async function getAllPitchesForUserAction(
  userId: string
): Promise<ActionState<SelectPitch[]>> {
  try {
    const pitches = await db
      .select()
      .from(pitchesTable)
      .where(eq(pitchesTable.userId, userId))
      .orderBy(desc(pitchesTable.createdAt))

    return { isSuccess: true, message: "Pitches retrieved", data: pitches }
  } catch (err) {
    console.error("getAllPitchesForUserAction:", err)
    return { isSuccess: false, message: "Failed to retrieve pitches" }
  }
}

/* ------------------------------------------------------------------ */
/*  Update                                                            */
/* ------------------------------------------------------------------ */

export async function updatePitchAction(
  id: string,
  updatedData: Partial<InsertPitch>,
  userId: string
): Promise<ActionState<SelectPitch>> {
  if (!validateUUID(id)) {
    return { isSuccess: false, message: "Invalid pitch ID format" }
  }
  if (!updatedData || Object.keys(updatedData).length === 0) {
    return { isSuccess: false, message: "No update data provided" }
  }

  try {
    const [updated] = await db
      .update(pitchesTable)
      .set(updatedData)
      .where(and(eq(pitchesTable.id, id), eq(pitchesTable.userId, userId)))
      .returning()

    return updated
      ? { isSuccess: true, message: "Pitch updated", data: updated }
      : { isSuccess: false, message: "Pitch not found or not owned by user" }
  } catch (err) {
    console.error("updatePitchAction:", err)
    return { isSuccess: false, message: "Failed to update pitch" }
  }
}

/**
 * Update by `agentExecutionId` with transaction for atomicity.
 */
export async function updatePitchByExecutionId(
  execId: string,
  updatedData: Partial<InsertPitch>
): Promise<ActionState<SelectPitch>> {
  if (!execId) {
    return { isSuccess: false, message: "Execution ID must be provided" }
  }
  if (!updatedData || Object.keys(updatedData).length === 0) {
    return { isSuccess: false, message: "No update data provided" }
  }

  debugLog(`[updatePitchByExecutionId] Starting with execId: ${execId}`)
  debugLog(
    `[updatePitchByExecutionId] Updating with data size:`,
    updatedData.pitchContent
      ? updatedData.pitchContent.length + " chars"
      : "No content"
  )

  try {
    // Use transaction to ensure atomic read + update
    const result = await db.transaction(async tx => {
      let existing = await tx
        .select({ id: pitchesTable.id })
        .from(pitchesTable)
        .where(eq(pitchesTable.agentExecutionId, execId))
        .limit(1)

      if (existing.length === 0) {
        debugLog(
          `[updatePitchByExecutionId] No record found with agentExecutionId: ${execId}, trying pitch ID`
        )
        existing = await tx
          .select({ id: pitchesTable.id })
          .from(pitchesTable)
          .where(eq(pitchesTable.id, execId))
          .limit(1)
      }

      if (existing.length === 0) {
        throw new Error("No pitch with that execution‑ID or pitch ID")
      }

      debugLog(
        `[updatePitchByExecutionId] Found matching record with ID: ${existing[0].id}`
      )

      const [updated] = await tx
        .update(pitchesTable)
        .set(updatedData)
        .where(
          or(
            eq(pitchesTable.agentExecutionId, execId),
            eq(pitchesTable.id, execId)
          )
        )
        .returning()

      if (!updated) {
        throw new Error("Update operation failed")
      }

      return updated
    })

    debugLog(
      `[updatePitchByExecutionId] Successfully updated pitch: ${result.id}`
    )
    return { isSuccess: true, message: "Pitch updated", data: result }
  } catch (err: any) {
    console.error(`[updatePitchByExecutionId] Error:`, err)
    return {
      isSuccess: false,
      message: `Failed to update pitch: ${err.message}`
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Delete                                                            */
/* ------------------------------------------------------------------ */

export async function deletePitchAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  if (!validateUUID(id)) {
    return { isSuccess: false, message: "Invalid pitch ID format" }
  }

  try {
    const res = await db
      .delete(pitchesTable)
      .where(and(eq(pitchesTable.id, id), eq(pitchesTable.userId, userId)))
      .returning()

    return res.length
      ? { isSuccess: true, message: "Pitch deleted", data: undefined }
      : { isSuccess: false, message: "Pitch not found or not owned by user" }
  } catch (err) {
    console.error("deletePitchAction:", err)
    return { isSuccess: false, message: "Failed to delete pitch" }
  }
}

/* ------------------------------------------------------------------ */
/*  Custom Update Helpers                                             */
/* ------------------------------------------------------------------ */

export async function savePitchContentAction(
  id: string,
  userId: string,
  content: string
): Promise<ActionState<SelectPitch>> {
  return await updatePitchAction(
    id,
    { pitchContent: content, updatedAt: new Date() },
    userId
  )
}
