"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export default function CheckStoredPitch({
  onReady
}: {
  onReady?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const isNewPitch = searchParams.get("new") === "true"
    const stepParam = searchParams.get("step")
    const storedPitchId = sessionStorage.getItem("ongoingPitchId")

    if (isNewPitch) {
      sessionStorage.removeItem("ongoingPitchId")
      let newUrl = window.location.pathname
      if (stepParam) newUrl += `?step=${stepParam}`
      if (window.location.pathname + window.location.search !== newUrl) {
        window.history.replaceState({}, "", newUrl)
      }
      onReady?.()
      return
    }

    if (storedPitchId) {
      const query = window.location.search
      const targetUrl = `/dashboard/new/${storedPitchId}${query}`

      // Only redirect if we are not already on the target URL
      if (window.location.pathname + window.location.search !== targetUrl) {
        router.replace(targetUrl)
      } else {
        onReady?.()
      }
    } else {
      // Redirect to clean /new only if not already there
      if (pathname !== "/dashboard/new") {
        router.replace("/dashboard/new")
      } else {
        onReady?.()
      }
    }
  }, [router, searchParams, onReady, pathname])

  return null
}
