"use server"

/**
 * CRUD helpers for the `pitches` table (Drizzle + Postgres).
 *
 * NEW (for realtime callback flow)
 * ───────────────────────────────
 * • getPitchByExecutionIdAction
 * • updatePitchByExecutionId
 *
 * Both work on the `agentExecutionId` column that stores the
 * PromptLayer `workflow_version_execution_id`.
 */

import { db } from "@/db/db"
import {
  InsertPitch,
  SelectPitch,
  pitchesTable
} from "@/db/schema/pitches-schema"
import { eq, and, desc } from "drizzle-orm"
import { ActionState } from "@/types"

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
  try {
    const [pitch] = await db
      .select()
      .from(pitchesTable)
      .where(eq(pitchesTable.agentExecutionId, execId))
      .limit(1)

    return pitch
      ? { isSuccess: true, message: "Pitch found", data: pitch }
      : { isSuccess: false, message: "No pitch with that execution‑ID" }
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
 * Update by `agentExecutionId` – used inside PromptLayer callback where
 * we do **not** know the userId or pitchId, only the execution‑ID.
 */
export async function updatePitchByExecutionId(
  execId: string,
  updatedData: Partial<InsertPitch>
): Promise<ActionState<SelectPitch>> {
  try {
    const [updated] = await db
      .update(pitchesTable)
      .set(updatedData)
      .where(eq(pitchesTable.agentExecutionId, execId))
      .returning()

    return updated
      ? { isSuccess: true, message: "Pitch updated", data: updated }
      : { isSuccess: false, message: "No pitch with that execution‑ID" }
  } catch (err) {
    console.error("updatePitchByExecutionId:", err)
    return { isSuccess: false, message: "Failed to update pitch" }
  }
}

/* ------------------------------------------------------------------ */
/*  Delete                                                            */
/* ------------------------------------------------------------------ */

export async function deletePitchAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
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