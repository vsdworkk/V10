"use server"

/**
 * Dashboard-specific actions that combine multiple data fetches
 * for optimal performance.
 */

import { db } from "@/db/db"
import { pitchesTable, SelectPitch } from "@/db/schema/pitches-schema"
import { profilesTable, SelectProfile } from "@/db/schema/profiles-schema"
import { ActionState } from "@/types"
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
    // Execute both queries in parallel for better performance
    const [profileResult, pitchesResult] = await Promise.all([
      // Fetch user profile
      db.query.profiles.findFirst({
        where: eq(profilesTable.userId, userId)
      }),
      // Fetch user pitches
      db
        .select()
        .from(pitchesTable)
        .where(eq(pitchesTable.userId, userId))
        .orderBy(desc(pitchesTable.createdAt))
    ])

    if (!profileResult) {
      return { 
        isSuccess: false, 
        message: "Profile not found. Please complete your profile setup." 
      }
    }

    return {
      isSuccess: true,
      message: "Dashboard data retrieved successfully",
      data: {
        profile: profileResult,
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