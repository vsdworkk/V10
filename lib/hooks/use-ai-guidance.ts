// React hook that orchestrates requesting Albert guidance and polling for the result.
// Exposes loading state, generated guidance, any errors and a reset helper.
import { useState, useEffect } from "react"
import {
  requestGuidance,
  checkGuidanceStatus
} from "@/lib/services/ai-guidance-service"
import { debugLog } from "@/lib/debug"

export function useAiGuidance() {
  const [isLoading, setIsLoading] = useState(false)
  const [guidance, setGuidance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  // Function to request guidance
  const fetchGuidance = async (
    jobDescription: string,
    experience: string,
    userId: string,
    pitchId?: string
  ) => {
    debugLog("[useAiGuidance] fetchGuidance called - setting isLoading to true")
    setIsLoading(true)
    setError(null)

    try {
      const result = await requestGuidance({
        jobDescription,
        experience,
        userId,
        pitchId
      })

      if (!result.isSuccess) {
        debugLog(
          "[useAiGuidance] fetchGuidance received error:",
          result.message
        )
        throw new Error(result.message)
      }

      debugLog(
        "[useAiGuidance] fetchGuidance succeeded, setting requestId:",
        result.data
      )
      setRequestId(result.data)

      // If we already have guidance in the database (e.g., from a previous request),
      // immediately check if it's available
      setTimeout(() => {
        debugLog("[useAiGuidance] Immediate check for existing guidance")
        checkGuidanceStatus(result.data)
          .then(statusResult => {
            if (statusResult.isSuccess && statusResult.data) {
              debugLog(
                "[useAiGuidance] Found guidance immediately:",
                statusResult.data.substring(0, 20) + "..."
              )
              setGuidance(statusResult.data)
              setIsLoading(false)
            } else {
              debugLog("[useAiGuidance] No immediate guidance found, will poll")
            }
          })
          .catch(err =>
            console.error(
              "[useAiGuidance] Error checking immediate guidance:",
              err
            )
          )
      }, 100)
    } catch (err) {
      console.error("[useAiGuidance] fetchGuidance error:", err)
      setError(
        err instanceof Error ? err.message : "Failed to request guidance"
      )
      setIsLoading(false)
    }
  }

  // Poll for guidance status when requestId changes
  useEffect(() => {
    if (!requestId) return

    const pollInterval = 3000 // 3 seconds
    let attempts = 0
    const maxAttempts = 20 // Timeout after ~1 minute
    let isPolling = true // Flag to track if polling is active

    const checkStatus = async () => {
      if (!isPolling) return true // Don't continue if polling was stopped

      try {
        const result = await checkGuidanceStatus(requestId)

        if (result.isSuccess && result.data) {
          debugLog(
            "[useAiGuidance] Received successful guidance data from service:",
            result.data
          )
          if (isPolling) {
            // Check flag before updating state
            setGuidance(result.data)
            debugLog("[useAiGuidance] Setting isLoading to false")
            setIsLoading(false)
            debugLog(
              "[useAiGuidance] Current states - isLoading:",
              false,
              "guidance:",
              result.data?.substring(0, 20) + "..."
            )
            isPolling = false // Stop polling
          }
          return true // Stop polling
        }

        // Continue polling if not complete
        attempts++
        debugLog(
          `[useAiGuidance] Poll attempt ${attempts}/${maxAttempts}, continuing polling`
        )
        if (attempts >= maxAttempts) {
          debugLog(
            "[useAiGuidance] Reached max attempts, setting error and stopping polling"
          )
          if (isPolling) {
            // Check flag before updating state
            setError("Guidance generation timed out. Please try again.")
            setIsLoading(false)
            isPolling = false // Stop polling
          }
          return true // Stop polling
        }

        if (!isPolling) return true // Don't continue if polling was stopped
        return false // Continue polling
      } catch (err) {
        console.error("[useAiGuidance] Error during polling:", err)
        if (isPolling) {
          // Check flag before updating state
          setError(
            err instanceof Error
              ? err.message
              : "Failed to check guidance status"
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
      debugLog("[useAiGuidance] Cleanup function called, stopping polling")
      isPolling = false // Signal to stop polling on unmount
      attempts = maxAttempts // Force stop on unmount (legacy approach)
    }
  }, [requestId])

  return {
    isLoading,
    guidance,
    error,
    requestId,
    fetchGuidance,
    reset: () => {
      setGuidance(null)
      setError(null)
      setRequestId(null)
      setIsLoading(false)
    }
  }
}
