/*
Contains the utility functions for the app.
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Patch a pitch with partial data via the API.
 */
export async function partialUpdatePitch(
  pitchId: string,
  userId: string,
  partialData: Record<string, unknown>
) {
  const res = await fetch(`/api/pitches/${pitchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: pitchId, userId, ...partialData })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to update pitch")
  }

  return res.json()
}
