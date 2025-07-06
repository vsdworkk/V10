/*
Server actions for requesting Albert guidance and checking
its completion status via the existing API routes. Replaces
client-side service functions.
*/

"use server"

import { ActionState } from "@/types"

interface GuidanceRequest {
  jobDescription: string
  experience: string
  userId: string
  pitchId?: string
}

const inFlightRequests = new Set<string>()

export async function requestGuidanceAction(
  request: GuidanceRequest
): Promise<ActionState<string>> {
  try {
    if (!request.pitchId) {
      return {
        isSuccess: false,
        message: "A pitch must be created before requesting guidance"
      }
    }

    const requestId = request.pitchId

    if (inFlightRequests.has(requestId)) {
      return {
        isSuccess: true,
        message: "Guidance request already in progress",
        data: requestId
      }
    }

    inFlightRequests.add(requestId)

    const response = await fetch("/api/guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobDescription: request.jobDescription,
        experience: request.experience,
        userId: request.userId,
        pitchId: request.pitchId
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error((errorData as any).error || `Error: ${response.status}`)
    }

    const data = await response.json().catch(() => ({}))
    return {
      isSuccess: true,
      message: (data as any).message || "Guidance request initiated",
      data: requestId
    }
  } catch (error) {
    console.error("Guidance request error:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error ? error.message : "Failed to request guidance"
    }
  } finally {
    if (request.pitchId) inFlightRequests.delete(request.pitchId)
  }
}

export async function checkGuidanceStatusAction(
  requestId: string
): Promise<ActionState<string>> {
  try {
    const response = await fetch(`/api/guidance/status?requestId=${requestId}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error((errorData as any).error || `Error: ${response.status}`)
    }

    const data = await response.json().catch(() => ({}))

    if ((data as any).status === "completed") {
      return {
        isSuccess: true,
        message: "Guidance generated",
        data: (data as any).guidance
      }
    }

    return {
      isSuccess: false,
      message: "Guidance still processing"
    }
  } catch (error) {
    console.error("Guidance status check error:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to check guidance status"
    }
  }
}
