/*
Contains the utility functions for the app.
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string for display with relative time indicators
 */
export function formatDate(date: string) {
  let currentDate = new Date().getTime()
  if (!date.includes("T")) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date).getTime()
  let timeDifference = Math.abs(currentDate - targetDate)
  let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

  let fullDate = new Date(date).toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  if (daysAgo < 1) {
    return "Today"
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7)
    return `${fullDate} (${weeksAgo}w ago)`
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30)
    return `${fullDate} (${monthsAgo}mo ago)`
  } else {
    const yearsAgo = Math.floor(daysAgo / 365)
    return `${fullDate} (${yearsAgo}y ago)`
  }
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
