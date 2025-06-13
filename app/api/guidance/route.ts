// API route to request AI guidance generation
import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"
import { debugLog } from "@/lib/debug"

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, experience, userId, pitchId } = await req.json()

    if (!jobDescription || !experience || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate that a pitch ID exists
    if (!pitchId) {
      return NextResponse.json(
        {
          error:
            "Missing pitchId - a pitch must be created before requesting guidance"
        },
        { status: 400 }
      )
    }

    // Use the pitchId as the requestId for the agent
    const requestId = pitchId

    // Store the request in database with pending status
    try {
      const updateResult = await updatePitchByExecutionId(requestId, {
        agentExecutionId: requestId
      })

      if (!updateResult.isSuccess) {
        console.error(
          `Failed to update pitch with execution ID: ${updateResult.message}`
        )
        return NextResponse.json(
          { error: `Failed to update pitch: ${updateResult.message}` },
          { status: 500 }
        )
      }

      debugLog(`Successfully updated pitch with execution ID: ${requestId}`)
    } catch (error) {
      console.error(`Error updating pitch with execution ID: ${error}`)
      return NextResponse.json(
        { error: `Error updating pitch: ${error}` },
        { status: 500 }
      )
    }

    // Call PromptLayer with proper error handling and timeout
    const promptLayerApiKey = process.env.AGENT_API_KEY
    if (!promptLayerApiKey) {
      return NextResponse.json(
        { error: "PromptLayer API key not configured" },
        { status: 500 }
      )
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"}/api/guidance/callback`

    // We use AbortController to handle timeouts
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(
        "https://api.promptlayer.com/workflows/AI Guidance/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": promptLayerApiKey
          },
          body: JSON.stringify({
            workflow_label_name: "v1",
            input_variables: {
              job_description: jobDescription,
              User_Experience: experience,
              id_unique: requestId
            },
            metadata: {
              source: "webapp",
              callback_url: callbackUrl
            }
          }),
          signal: controller.signal
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`PromptLayer error: ${errorText}`)
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        requestId,
        message: "Guidance request initiated"
      })
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 504 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error requesting guidance:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    )
  }
}
