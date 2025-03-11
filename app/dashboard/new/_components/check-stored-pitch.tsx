"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * @description
 * Client component that checks for a stored pitch ID in local storage
 * and redirects to the pitch edit page if found.
 * 
 * If the URL contains ?new=true, it will clear any stored ID
 * to ensure a fresh start.
 */
export default function CheckStoredPitch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewPitch = searchParams.get('new') === 'true'

  useEffect(() => {
    // If explicitly creating a new pitch, clear any stored ID
    if (isNewPitch) {
      localStorage.removeItem('currentPitchId')
      // Update the URL to remove the query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      return
    }
    
    // Check if there's a stored pitch ID
    const storedPitchId = localStorage.getItem('currentPitchId')
    
    if (storedPitchId) {
      // Redirect to the pitch edit page
      router.push(`/dashboard/new/${storedPitchId}`)
    }
  }, [router, isNewPitch])

  // This component doesn't render anything
  return null
} 