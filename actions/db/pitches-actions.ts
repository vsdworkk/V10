/**
 * @description
 * Provides CRUD actions for managing pitch records in the 'pitches' table.
 * 
 * Key Exports:
 * - createPitchAction: Insert a new pitch record
 * - getPitchByIdAction: Fetch a single pitch by ID for a given user
 * - updatePitchAction: Update an existing pitch's details
 * - getAllPitchesForUserAction: Retrieve all pitches belonging to a specific user
 * - deletePitchAction: Remove a pitch by ID for a specific user
 *
 * @notes
 * - Each function returns an ActionState<T>, indicating success/failure status.
 * - We rely on Drizzle's typed schemas and eq conditions from drizzle-orm.
 * - This file must follow the project rules (no partial code, all-lowercase, etc.).
 */

"use server"

import { db } from "@/db/db"
import {
  InsertPitch,
  SelectPitch,
  pitchesTable
} from "@/db/schema/pitches-schema"
import { eq, and, desc } from "drizzle-orm"
import { ActionState } from "@/types"

/**
 * @function createPitchAction
 * @description
 * Creates a new pitch record in the "pitches" table.
 *
 * @param pitchData - InsertPitch: The new pitch data from the user wizard.
 * @returns Promise<ActionState<SelectPitch>> - The result state with either success or failure.
 *
 * @notes
 * - We wrap in a try/catch to handle DB errors gracefully.
 * - We insert user-supplied data, returning the newly created pitch row.
 */
export async function createPitchAction(
  pitchData: InsertPitch
): Promise<ActionState<SelectPitch>> {
  try {
    // Drizzle returns an array of inserted rows. We only expect one here.
    const [newPitch] = await db.insert(pitchesTable).values(pitchData).returning()

    return {
      isSuccess: true,
      message: "Pitch created successfully",
      data: newPitch
    }
  } catch (error) {
    console.error("Error creating pitch:", error)
    return {
      isSuccess: false,
      message: "Failed to create pitch"
    }
  }
}

/**
 * @function getPitchByIdAction
 * @description
 * Fetches a single pitch by ID, ensuring it belongs to the specified user.
 *
 * @param id - string: The pitch ID we want to look up.
 * @param userId - string: The user ID to which the pitch must belong.
 * @returns Promise<ActionState<SelectPitch>> - Success with the pitch record if found, else failure.
 */
export async function getPitchByIdAction(
  id: string,
  userId: string
): Promise<ActionState<SelectPitch>> {
  try {
    const [pitch] = await db
      .select()
      .from(pitchesTable)
      .where(
        and(
          eq(pitchesTable.id, id),
          eq(pitchesTable.userId, userId)
        )
      )
      .limit(1)

    if (!pitch) {
      return {
        isSuccess: false,
        message: "Pitch not found or does not belong to this user"
      }
    }

    return {
      isSuccess: true,
      message: "Pitch retrieved successfully",
      data: pitch
    }
  } catch (error) {
    console.error("Error fetching pitch by ID:", error)
    return {
      isSuccess: false,
      message: "Failed to fetch pitch"
    }
  }
}

/**
 * @function updatePitchAction
 * @description
 * Updates an existing pitch record with the given data, ensuring user ownership.
 *
 * @param id - string: The unique pitch ID we want to update.
 * @param updatedData - Partial<InsertPitch>: The fields we want to modify.
 * @param userId - string: The user ID for ownership validation.
 * @returns Promise<ActionState<SelectPitch>> - Updated pitch record on success, or failure message.
 *
 * @notes
 * - Only fields included in updatedData will be altered. Others remain unchanged.
 */
export async function updatePitchAction(
  id: string,
  updatedData: Partial<InsertPitch>,
  userId: string
): Promise<ActionState<SelectPitch>> {
  try {
    const [updatedPitch] = await db
      .update(pitchesTable)
      .set(updatedData)
      .where(
        and(
          eq(pitchesTable.id, id),
          eq(pitchesTable.userId, userId)
        )
      )
      .returning()

    if (!updatedPitch) {
      return {
        isSuccess: false,
        message: "Pitch not found or does not belong to this user"
      }
    }

    return {
      isSuccess: true,
      message: "Pitch updated successfully",
      data: updatedPitch
    }
  } catch (error) {
    console.error("Error updating pitch:", error)
    return {
      isSuccess: false,
      message: "Failed to update pitch"
    }
  }
}

/**
 * @function getAllPitchesForUserAction
 * @description
 * Retrieves all pitch records that belong to a particular user.
 *
 * @param userId - string: The user ID to filter by.
 * @returns Promise<ActionState<SelectPitch[]>> - Array of pitch records on success, or failure message.
 *
 * @notes
 * - If no records are found, returns an empty array with success = true.
 */
export async function getAllPitchesForUserAction(
  userId: string
): Promise<ActionState<SelectPitch[]>> {
  try {
    const pitches = await db
      .select()
      .from(pitchesTable)
      .where(eq(pitchesTable.userId, userId))
      .orderBy(desc(pitchesTable.createdAt))

    return {
      isSuccess: true,
      message: "Pitches retrieved successfully",
      data: pitches
    }
  } catch (error) {
    console.error("Error fetching all pitches for user:", error)
    return {
      isSuccess: false,
      message: "Failed to retrieve pitches"
    }
  }
}

/**
 * @function deletePitchAction
 * @description
 * Deletes a pitch by ID, ensuring user ownership for security.
 *
 * @param id - string: The pitch ID to delete.
 * @param userId - string: The user ID used to validate ownership.
 * @returns Promise<ActionState<void>> - isSuccess indicates whether the deletion was successful.
 */
export async function deletePitchAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    const result = await db
      .delete(pitchesTable)
      .where(
        and(
          eq(pitchesTable.id, id),
          eq(pitchesTable.userId, userId)
        )
      )
      .returning() // this returns an array, but we won't use the row data

    if (result.length === 0) {
      return {
        isSuccess: false,
        message: "Pitch not found or does not belong to this user"
      }
    }

    return {
      isSuccess: true,
      message: "Pitch deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting pitch:", error)
    return {
      isSuccess: false,
      message: "Failed to delete pitch"
    }
  }
}