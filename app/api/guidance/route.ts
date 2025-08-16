// API route to request AI guidance generation
import { NextRequest, NextResponse } from "next/server"
import {
  updatePitchByExecutionId,
  getPitchByIdAction
} from "@/actions/db/pitches-actions"
import { debugLog } from "@/lib/debug"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  // Keep requestId in outer scope so we can attempt to clear it on any error
  let requestId: string | null = null

  try {
    const { userId: currentUserId } = await auth()
    const { jobDescription, experience, userId, pitchId } = await req.json()

    if (!jobDescription || !experience || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (currentUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    requestId = pitchId

    // Check for existing guidance or in-progress requests
    const existing = await getPitchByIdAction(pitchId, userId)
    if (existing.isSuccess && existing.data) {
      if (existing.data.albertGuidance) {
        return NextResponse.json({
          success: true,
          requestId: existing.data.agentExecutionId || requestId,
          message: "Guidance already generated",
          guidance: existing.data.albertGuidance
        })
      }
      if (existing.data.agentExecutionId) {
        return NextResponse.json({
          success: true,
          requestId: existing.data.agentExecutionId,
          message: "Guidance request already in progress"
        })
      }
    }

    // Store "in-progress" status (agentExecutionId) BEFORE calling the external service
    try {
      if (!requestId) {
        return NextResponse.json(
          { error: "Invalid request ID" },
          { status: 400 }
        )
      }

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
      // IMPORTANT: clear "in progress" flag on failure to start
      try {
        if (requestId) {
          await updatePitchByExecutionId(requestId, { agentExecutionId: null })
        }
      } catch (e) {
        console.error(
          "Failed clearing agentExecutionId after missing API key",
          e
        )
      }

      return NextResponse.json(
        { error: "PromptLayer API key not configured" },
        { status: 500 }
      )
    }

    const callbackUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
    }/api/guidance/callback`

    // Use AbortController to handle timeouts
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

        // IMPORTANT: clear "in progress" flag when upstream returns error
        try {
          if (requestId) {
            await updatePitchByExecutionId(requestId, {
              agentExecutionId: null
            })
          }
        } catch (e) {
          console.error(
            "Failed clearing agentExecutionId after PromptLayer non-OK",
            e
          )
        }

        return NextResponse.json(
          { error: `PromptLayer error: ${errorText}` },
          { status: 500 }
        )
      }

      // Success: keep agentExecutionId set; the callback will populate albertGuidance later
      return NextResponse.json({
        success: true,
        requestId,
        message: "Guidance request initiated"
      })
    } catch (error) {
      clearTimeout(timeoutId)

      // IMPORTANT: clear "in progress" flag on timeout or any fetch error
      try {
        if (requestId)
          await updatePitchByExecutionId(requestId, {
            agentExecutionId: null
          })
      } catch (e) {
        console.error("Failed clearing agentExecutionId after fetch error", e)
      }

      if ((error as Error).name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 504 })
      }

      return NextResponse.json(
        {
          error:
            (error as Error).message || "Failed to initiate guidance request"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    // LAST RESORT: attempt to clear the flag if we got far enough to have a requestId
    try {
      if (requestId)
        await updatePitchByExecutionId(requestId, { agentExecutionId: null })
    } catch (e) {
      console.error("Failed clearing agentExecutionId in outer catch", e)
    }

    console.error("Error requesting guidance:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    )
  }
}
