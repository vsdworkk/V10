//
// Utility functions for caching user profiles in cookies.
//

import { cookies } from "next/headers"
import { SelectProfile } from "@/db/schema/profiles-schema"

const COOKIE_PREFIX = "profile_"
const MAX_AGE = 60 * 60 * 24 // 1 day

export async function getCachedProfile(
  userId: string
): Promise<SelectProfile | null> {
  const store = await cookies()
  const cookie = store.get(`${COOKIE_PREFIX}${userId}`)
  if (!cookie) return null
  try {
    return JSON.parse(cookie.value) as SelectProfile
  } catch {
    return null
  }
}

export async function setCachedProfile(profile: SelectProfile) {
  const store = await cookies()
  store.set(`${COOKIE_PREFIX}${profile.userId}`, JSON.stringify(profile), {
    path: "/",
    maxAge: MAX_AGE
  })
}

export async function clearCachedProfile(userId: string) {
  const store = await cookies()
  store.delete(`${COOKIE_PREFIX}${userId}`)
}
