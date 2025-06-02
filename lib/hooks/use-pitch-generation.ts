// React hook for generating a pitch via the API and polling for the result.
// Also supports polling for an existing pitch by ID without re-triggering

import { useState, useEffect } from "react"
import {
  requestPitchGeneration,
  checkPitchGenerationStatus
} from "@/lib/services/pitch-generation-service"
import type { StarJsonbSchema } from "@/db/schema/pitches-schema"

export function usePitchGeneration() {
  const [isLoading, setIsLoading] = useState(false)
  const [pitchContent, setPitchContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null) // This will actually hold the pitch ID

  // Function to request pitch generation
  const generatePitch = async (pitchData: {
    userId: string
    roleName: string
    organisationName: string
    roleLevel: string
    pitchWordLimit: number
    roleDescription: string
    relevantExperience: string
    albertGuidance: string
    starExamples: StarJsonbSchema // Use the proper type from schema
    starExamplesCount: number
    pitchId: string // The pitch ID that will be used as the execution ID
  }) => {
    console.log(
      "[usePitchGeneration] generatePitch called - setting isLoading to true"
    )
    setIsLoading(true)
    setError(null)

    try {
      const result = await requestPitchGeneration(pitchData)

      if (!result.isSuccess) {
        console.log(
          "[usePitchGeneration] generatePitch received error:",
          result.message
        )
        throw new Error(result.message)
      }

      // Store the pitch ID as the requestId - following the same pattern as guidance
      console.log(
        "[usePitchGeneration] generatePitch succeeded, setting requestId:",
        result.data
      )
      setRequestId(result.data)

      // Immediately check if we already have a pitch in the database
      setTimeout(() => {
        console.log("[usePitchGeneration] Immediate check for existing pitch")
        checkPitchGenerationStatus(result.data)
          .then(statusResult => {
            if (statusResult.isSuccess && statusResult.data) {
              console.log(
                "[usePitchGeneration] Found pitch immediately:",
                statusResult.data.substring(0, 20) + "..."
              )
              setPitchContent(statusResult.data)
              setIsLoading(false)
            } else {
              console.log(
                "[usePitchGeneration] No immediate pitch found, will poll"
              )
            }
          })
          .catch(err =>
            console.error(
              "[usePitchGeneration] Error checking immediate pitch:",
              err
            )
          )
      }, 100)
    } catch (err: any) {
      console.error("[usePitchGeneration] generatePitch error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to request pitch generation"
      )
      setIsLoading(false)
    }
  }

  // Start polling for an existing pitch without triggering a new generation
  const startPolling = async (existingRequestId: string) => {
    setPitchContent(null)
    setError(null)
    setIsLoading(true)
    setRequestId(existingRequestId)

    try {
      const statusResult = await checkPitchGenerationStatus(existingRequestId)
      if (statusResult.isSuccess && statusResult.data) {
        setPitchContent(statusResult.data)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("[usePitchGeneration] Error checking immediate pitch:", err)
    }
  }

  // Poll for pitch generation status when requestId changes
  // The requestId is actually the pitch ID
  useEffect(() => {
    if (!requestId) return

    const pollInterval = 3000 // 3 seconds
    let attempts = 0
    const maxAttempts = 60 // Timeout after ~3 minutes (pitch generation might take longer than guidance)
    let isPolling = true // Flag to track if polling is active

    const checkStatus = async () => {
      if (!isPolling) return true // Don't continue if polling was stopped

      try {
        // Check status using the pitch ID as the requestId
        const result = await checkPitchGenerationStatus(requestId)

        if (result.isSuccess && result.data) {
          console.log(
            "[usePitchGeneration] Received successful pitch data from service"
          )
          if (isPolling) {
            // Check flag before updating state
            setPitchContent(result.data)
            console.log("[usePitchGeneration] Setting isLoading to false")
            setIsLoading(false)
            isPolling = false // Stop polling
          }
          return true // Stop polling
        }

        // Continue polling if not complete
        attempts++
        console.log(
          `[usePitchGeneration] Poll attempt ${attempts}/${maxAttempts}, continuing polling`
        )
        if (attempts >= maxAttempts) {
          console.log(
            "[usePitchGeneration] Reached max attempts, setting error and stopping polling"
          )
          if (isPolling) {
            // Check flag before updating state
            setError("Pitch generation timed out. Please try again.")
            setIsLoading(false)
            isPolling = false // Stop polling
          }
          return true // Stop polling
        }

        if (!isPolling) return true // Don't continue if polling was stopped
        return false // Continue polling
      } catch (err: any) {
        console.error("[usePitchGeneration] Error during polling:", err)
        if (isPolling) {
          // Check flag before updating state
          setError(
            err instanceof Error
              ? err.message
              : "Failed to check pitch generation status"
          )
          setIsLoading(false)
          isPolling = false // Stop polling
        }
        return true // Stop polling on error
      }
    }

    // Start polling
    const poll = async () => {
      const shouldStop = await checkStatus()
      if (!shouldStop && isPolling) {
        setTimeout(poll, pollInterval)
      }
    }

    // Force loading state at the start of polling
    setIsLoading(true)
    poll()

    // Cleanup
    return () => {
      console.log(
        "[usePitchGeneration] Cleanup function called, stopping polling"
      )
      isPolling = false // Signal to stop polling on unmount
      attempts = maxAttempts // Force stop on unmount (legacy approach)
    }
  }, [requestId])

  return {
    isLoading,
    pitchContent,
    error,
    requestId, // This is actually the pitch ID
    generatePitch,
    startPolling,
    reset: () => {
      setPitchContent(null)
      setError(null)
      setRequestId(null)
      setIsLoading(false)
    }
  }
}
