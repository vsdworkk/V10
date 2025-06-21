"use server"

/**
 * Dashboard-specific actions that combine multiple data fetches
 * for optimal performance.
 */

import { db } from "@/db/db"
import { pitchesTable, SelectPitch } from "@/db/schema/pitches-schema"
import { SelectProfile } from "@/db/schema/profiles-schema"
import { ActionState } from "@/types"
import { ensureProfileAction } from "./profiles-actions"
import { eq, desc } from "drizzle-orm"

export interface DashboardData {
  profile: SelectProfile
  pitches: SelectPitch[]
}

/**
 * Fetches all dashboard data in parallel for optimal performance
 */
export async function getDashboardDataAction(
  userId: string
): Promise<ActionState<DashboardData>> {
  try {
    // Ensure the profile exists before fetching other data
    const [profileResult, pitchesResult] = await Promise.all([
      ensureProfileAction(userId),
      // Fetch user pitches
      db
        .select()
        .from(pitchesTable)
        .where(eq(pitchesTable.userId, userId))
        .orderBy(desc(pitchesTable.createdAt))
    ])

    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, message: profileResult.message }
    }

    return {
      isSuccess: true,
      message: "Dashboard data retrieved successfully",
      data: {
        profile: profileResult.data,
        pitches: pitchesResult || []
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      isSuccess: false,
      message: "Failed to load dashboard data"
    }
  }
}
