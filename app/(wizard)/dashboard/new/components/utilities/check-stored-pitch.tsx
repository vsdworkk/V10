"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Client component that:
 * - Clears pitchId from sessionStorage if URL is `/new?new=true` (fresh start)
 * - If URL has a step param (e.g., `/new?step=2`), tries to load pitchId from sessionStorage
 *   and redirects to `/dashboard/new/[pitchId]?step=2` to resume
 */
export default function CheckStoredPitch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isNewPitch = searchParams.get("new") === "true"
  const stepParam = searchParams.get("step")

  useEffect(() => {
    // Case 1: Explicit new pitch requested -> clear stored ID
    if (isNewPitch) {
      sessionStorage.removeItem("ongoingPitchId")

      // Remove ?new param but keep step if present
      let newUrl = window.location.pathname
      if (stepParam) {
        newUrl += `?step=${stepParam}`
      }
      window.history.replaceState({}, "", newUrl)
      return
    }

    // Case 2: URL has ?step=..., meaning resuming existing pitch
    if (stepParam) {
      const storedPitchId = sessionStorage.getItem("ongoingPitchId")

      if (storedPitchId) {
        // Redirect to edit page with pitchId and preserve step param
        router.replace(`/dashboard/new/${storedPitchId}?step=${stepParam}`)
      } else {
        // Optional fallback: no stored pitchId — redirect to clean /new page or dashboard
        router.replace("/dashboard/new")
      }
    }
  }, [router, isNewPitch, stepParam])

  return null
}
