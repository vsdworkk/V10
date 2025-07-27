"use server"

/**
 * Server actions related to user profiles.
 * Handles CRUD operations, credit management, and ensures profile consistency.
 */

import {
  profilesTable,
  InsertProfile,
  SelectProfile
} from "@/db/schema/profiles-schema"
import { revalidatePath } from "next/cache"
import { ActionState } from "@/types"
import { eq, sql } from "drizzle-orm"
import { db } from "@/db/db"

export async function createProfileAction(
  data: InsertProfile
): Promise<ActionState<SelectProfile>> {
  try {
    const [newProfile] = await db.insert(profilesTable).values(data).returning()
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
    console.error("Error retrieving profile:", error)
    return { isSuccess: false, message: "Failed to retrieve profile" }
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

    revalidatePath("/dashboard")

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

    revalidatePath("/dashboard")

    return {
      isSuccess: true,
      message: "Profile updated by Stripe customer ID successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating profile by Stripe customer ID:", error)
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
    revalidatePath("/dashboard")
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
    if (amount <= 0) {
      return {
        isSuccess: false,
        message: "Credit amount to add must be positive"
      }
    }

    const [updatedProfile] = await db
      .update(profilesTable)
      .set({ credits: sql`${profilesTable.credits} + ${amount}` })
      .where(eq(profilesTable.userId, userId))
      .returning()

    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found" }
    }

    if (updatedProfile.credits < 0) {
      return { isSuccess: false, message: "Invalid credit state after update" }
    }

    revalidatePath("/dashboard")

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
    if (amount <= 0) {
      return {
        isSuccess: false,
        message: "Credit amount to spend must be positive"
      }
    }

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

    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found to update" }
    }

    if (updatedProfile.credits < 0) {
      return { isSuccess: false, message: "Credits cannot be negative" }
    }

    revalidatePath("/dashboard")

    return {
      isSuccess: true,
      message: "Credits spent successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error spending credits:", error)
    return { isSuccess: false, message: "Failed to spend credits" }
  }
}

export async function ensureProfileAction(
  userId: string
): Promise<ActionState<SelectProfile>> {
  try {
    const existing = await getProfileByUserIdAction(userId)
    if (existing.isSuccess && existing.data) {
      return existing
    }

    const created = await createProfileAction({ userId })
    if (!created.isSuccess) {
      return { isSuccess: false, message: created.message }
    }

    return {
      isSuccess: true,
      message: "Profile ensured successfully",
      data: created.data
    }
  } catch (error) {
    console.error("Error ensuring profile:", error)
    return { isSuccess: false, message: "Failed to ensure profile" }
  }
}
