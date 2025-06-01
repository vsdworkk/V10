import type { ActionState } from "@/types"

interface GuidanceRequest {
  jobDescription: string
  experience: string
  userId: string
  pitchId?: string
}

export async function requestGuidance(
  request: GuidanceRequest
): Promise<ActionState<string>> {
  try {
    // PitchId is required in our new approach
    if (!request.pitchId) {
      return {
        isSuccess: false,
        message: "A pitch must be created before requesting guidance"
      }
    }

    // Use the pitch ID as the request ID
    const requestId = request.pitchId

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
      const errorData = await response.json()
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      isSuccess: true,
      message: "Guidance request initiated",
      data: requestId // Return the pitchId as the requestId
    }
  } catch (error) {
    console.error("Guidance request error:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error ? error.message : "Failed to request guidance"
    }
  }
}

export async function checkGuidanceStatus(
  requestId: string
): Promise<ActionState<string>> {
  try {
    const response = await fetch(`/api/guidance/status?requestId=${requestId}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "completed") {
      return {
        isSuccess: true,
        message: "Guidance generated",
        data: data.guidance
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
