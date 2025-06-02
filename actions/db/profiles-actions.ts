/*
Contains server actions related to profiles in the DB.
*/

"use server"

import { db } from "@/db/db"
import {
  InsertProfile,
  profilesTable,
  SelectProfile
} from "@/db/schema/profiles-schema"
import { ActionState } from "@/types"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { setCachedProfile } from "@/lib/profile-cache"

export async function createProfileAction(
  data: InsertProfile
): Promise<ActionState<SelectProfile>> {
  try {
    const [newProfile] = await db.insert(profilesTable).values(data).returning()
    await setCachedProfile(newProfile)
    return {
      isSuccess: true,
      message: "Profile created successfully",
      data: newProfile
    }
  } catch (error) {
    console.error("Error creating profile:", error)
    return { isSuccess: false, message: "Failed to create profile" }
  }
}

export async function getProfileByUserIdAction(
  userId: string
): Promise<ActionState<SelectProfile>> {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })
    if (!profile) {
      return { isSuccess: false, message: "Profile not found" }
    }

    return {
      isSuccess: true,
      message: "Profile retrieved successfully",
      data: profile
    }
  } catch (error) {
    console.error("Error getting profile by user id", error)
    return { isSuccess: false, message: "Failed to get profile" }
  }
}

export async function updateProfileAction(
  userId: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.userId, userId))
      .returning()

    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found to update" }
    }

    await setCachedProfile(updatedProfile)
    return {
      isSuccess: true,
      message: "Profile updated successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

export async function updateProfileByStripeCustomerIdAction(
  stripeCustomerId: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set(data)
      .where(eq(profilesTable.stripeCustomerId, stripeCustomerId))
      .returning()

    if (!updatedProfile) {
      return {
        isSuccess: false,
        message: "Profile not found by Stripe customer ID"
      }
    }

    await setCachedProfile(updatedProfile)
    return {
      isSuccess: true,
      message: "Profile updated by Stripe customer ID successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating profile by stripe customer ID:", error)
    return {
      isSuccess: false,
      message: "Failed to update profile by Stripe customer ID"
    }
  }
}

export async function deleteProfileAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.userId, userId))
    return {
      isSuccess: true,
      message: "Profile deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting profile:", error)
    return { isSuccess: false, message: "Failed to delete profile" }
  }
}

export async function addCreditsAction(
  userId: string,
  amount: number
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set({ credits: sql`${profilesTable.credits} + ${amount}` })
      .where(eq(profilesTable.userId, userId))
      .returning()

    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found" }
    }

    // Refresh dashboard cache so the UI shows updated credits immediately
    revalidatePath("/dashboard")

    await setCachedProfile(updatedProfile)
    return {
      isSuccess: true,
      message: "Credits added successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error adding credits:", error)
    return { isSuccess: false, message: "Failed to add credits" }
  }
}

export async function spendCreditsAction(
  userId: string,
  amount: number
): Promise<ActionState<SelectProfile>> {
  try {
    const profileResult = await getProfileByUserIdAction(userId)
    if (!profileResult.isSuccess || !profileResult.data) {
      return { isSuccess: false, message: "Profile not found" }
    }

    const currentCredits = profileResult.data.credits
    if (currentCredits < amount) {
      return { isSuccess: false, message: "Insufficient credits" }
    }

    const [updatedProfile] = await db
      .update(profilesTable)
      .set({
        credits: sql`${profilesTable.credits} - ${amount}`,
        creditsUsed: sql`${profilesTable.creditsUsed} + ${amount}`
      })
      .where(eq(profilesTable.userId, userId))
      .returning()

    await setCachedProfile(updatedProfile)
    return {
      isSuccess: true,
      message: "Credits used successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error using credits:", error)
    return { isSuccess: false, message: "Failed to use credits" }
  }
}
