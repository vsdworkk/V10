// lib/hooks/use-ai-guidance.ts
import { useState, useEffect, useCallback } from "react"
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
  const [triggerTimestamp, setTriggerTimestamp] = useState<string | null>(null)

  // Request guidance (idempotent at service & server)
  const fetchGuidance = useCallback(
    async (
      jobDescription: string,
      experience: string,
      userId: string,
      pitchId?: string
    ) => {
      debugLog(
        "[useAiGuidance] fetchGuidance called - setting isLoading to true"
      )
      setIsLoading(true)
      setError(null)
      setGuidance(null) // reset guidance on retry

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
        setTriggerTimestamp(new Date().toString())
        setRequestId(result.data) // triggers polling useEffect

        // Immediate status check after a slight delay to catch fast callbacks
        setTimeout(() => {
          debugLog("[useAiGuidance] Immediate check for existing guidance")
          checkGuidanceStatus(result.data)
            .then(statusResult => {
              if (statusResult.isSuccess && statusResult.data) {
                debugLog(
                  "[useAiGuidance] Found guidance immediately:",
                  statusResult.data.substring(0, 20) + "."
                )
                setGuidance(statusResult.data)
                setIsLoading(false)
              } else {
                debugLog(
                  "[useAiGuidance] No immediate guidance found, will poll"
                )
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
    },
    []
  ) // Empty dependency array - function doesn't depend on any props/state

  // Poll for guidance status when requestId changes
  useEffect(() => {
    if (!requestId) return

    let isPolling = true
    let attempts = 0
    const maxAttempts = 20
    const pollInterval = 3000

    const checkStatus = async () => {
      if (!isPolling) return true
      try {
        const result = await checkGuidanceStatus(requestId)
        if (result.isSuccess && result.data) {
          if (isPolling) {
            setGuidance(result.data)
            setIsLoading(false)
            isPolling = false
          }
          return true
        }

        attempts++
        if (attempts >= maxAttempts) {
          if (isPolling) {
            setError("Guidance generation timed out. Please try again.")
            setIsLoading(false)
            isPolling = false
          }
          return true
        }

        return false
      } catch (err) {
        if (isPolling) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to check guidance status"
          )
          setIsLoading(false)
          isPolling = false
        }
        return true // stop polling on error
      }
    }

    const poll = async () => {
      const shouldStop = await checkStatus()
      if (!shouldStop && isPolling) {
        setTimeout(poll, pollInterval)
      }
    }

    setIsLoading(true)
    poll()

    return () => {
      debugLog("[useAiGuidance] Cleanup called, stopping polling")
      isPolling = false
    }
  }, [requestId, triggerTimestamp])

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
