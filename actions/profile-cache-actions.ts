"use server"

/*
Server actions for manipulating profile cache cookies.
*/

import type { SelectProfile } from "@/db/schema/profiles-schema"
import { setCachedProfile, clearCachedProfile } from "@/lib/profile-cache"
import type { ActionState } from "@/types"

export async function cacheProfileAction(
  profile: SelectProfile
): Promise<ActionState<void>> {
  try {
    await setCachedProfile(profile)
    return { isSuccess: true, message: "Profile cached", data: undefined }
  } catch (error) {
    console.error("Error caching profile:", error)
    return { isSuccess: false, message: "Failed to cache profile" }
  }
}

export async function clearProfileCacheAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    await clearCachedProfile(userId)
    return { isSuccess: true, message: "Profile cache cleared", data: undefined }
  } catch (error) {
    console.error("Error clearing profile cache:", error)
    return { isSuccess: false, message: "Failed to clear profile cache" }
  }
}
