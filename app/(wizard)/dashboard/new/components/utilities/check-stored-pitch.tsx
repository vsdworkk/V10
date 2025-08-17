"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function CheckStoredPitch({
  onReady
}: {
  onReady?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const isNewPitch = searchParams.get("new") === "true"
    const stepParam = searchParams.get("step")
    const storedPitchId = sessionStorage.getItem("ongoingPitchId")

    if (isNewPitch) {
      sessionStorage.removeItem("ongoingPitchId")
      let newUrl = window.location.pathname
      if (stepParam) newUrl += `?step=${stepParam}`
      window.history.replaceState({}, "", newUrl)
      onReady?.()
      return
    }

    if (storedPitchId) {
      const query = window.location.search
      router.replace(`/dashboard/new/${storedPitchId}${query}`)
    } else {
      router.replace("/dashboard/new")
    }

    onReady?.()
  }, [router, searchParams, onReady])

  return null
}
