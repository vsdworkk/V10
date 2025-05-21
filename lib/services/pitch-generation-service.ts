import type { ActionState } from "@/types"
import type { StarJsonbSchema } from "@/db/schema/pitches-schema"

interface PitchGenerationRequest {
  userId: string
  roleName: string
  organisationName: string
  roleLevel: string
  pitchWordLimit: number
  roleDescription: string
  relevantExperience: string
  albertGuidance: string
  starExamples: StarJsonbSchema // Using the proper type from schema
  starExamplesCount: number
  pitchId: string // This is the key field that will be used as the execution ID
}

export async function requestPitchGeneration(
  request: PitchGenerationRequest
): Promise<ActionState<string>> {
  try {
    // PitchId is required - it will be used as the requestId/executionId
    if (!request.pitchId) {
      return {
        isSuccess: false,
        message: "A pitch ID is required for pitch generation"
      }
    }

    // Use the pitch ID as the request ID - same pattern as guidance system
    const requestId = request.pitchId

    const response = await fetch("/api/pitches/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      isSuccess: true,
      message: "Pitch generation request initiated",
      data: requestId // Return the pitch ID as the requestId
    }
  } catch (error) {
    console.error("Pitch generation request error:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to request pitch generation"
    }
  }
}

export async function checkPitchGenerationStatus(
  requestId: string
): Promise<ActionState<string>> {
  try {
    // requestId is actually the pitch ID
    const response = await fetch(
      `/api/pitches/generate/status?requestId=${requestId}`
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "completed") {
      return {
        isSuccess: true,
        message: "Pitch generated",
        data: data.pitchContent
      }
    }

    return {
      isSuccess: false,
      message: "Pitch still processing"
    }
  } catch (error) {
    console.error("Pitch generation status check error:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to check pitch generation status"
    }
  }
}
