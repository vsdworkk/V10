// API route to start pitch generation using n8n webhook
import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"
import { spendCreditsAction } from "@/actions/db/profiles-actions"
import { debugLog } from "@/lib/debug"

export async function POST(req: NextRequest) {
  try {
    const pitchData = await req.json()
    const {
      userId,
      pitchId,
      roleName,
      organisationName,
      roleLevel,
      pitchWordLimit,
      roleDescription,
      relevantExperience,
      albertGuidance,
      starExamples,
      starExamplesCount
    } = pitchData

    // Validate required fields
    if (!userId || !pitchId || !roleName || !roleLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const creditResult = await spendCreditsAction(userId, 1)
    if (!creditResult.isSuccess) {
      return NextResponse.json({ error: creditResult.message }, { status: 402 })
    }

    // Use the pitchId as the requestId for the agent - this is the key pattern
    // that matches the guidance system
    const requestId = pitchId

    // Store the request in database with the pitch ID set as the agentExecutionId
    try {
      const updateResult = await updatePitchByExecutionId(requestId, {
        agentExecutionId: requestId, // Store the pitch ID as the execution ID
        // Set status to indicate pitch generation is in progress
        status: "draft"
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

    // Call n8n webhook with proper error handling and timeout
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: "n8n webhook URL not configured" },
        { status: 500 }
      )
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"}/api/pitches/generate/callback`

    // We use AbortController to handle timeouts
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 seconds timeout

    try {
      // Prepare star examples in a format suitable for n8n
      const formattedStarExamples = starExamples.map(
        (ex: any, idx: number) => ({
          id: String(idx + 1),
          situation: [
            ex.situation?.["where-and-when-did-this-experience-occur"],
            ex.situation?.[
              "briefly-describe-the-situation-or-challenge-you-faced"
            ]
          ]
            .filter(Boolean)
            .join("\n"),
          task: [
            ex.task?.["what-was-your-responsibility-in-addressing-this-issue"],
            ex.task?.[
              "what-constraints-or-requirements-did-you-need-to-consider"
            ]
          ]
            .filter(Boolean)
            .join("\n"),
          action: ex.action.steps
            .map(
              (s: any, i: number) =>
                `Step ${i + 1}: ${s["what-did-you-specifically-do-in-this-step"]}` +
                (s["what-was-the-outcome-of-this-step-optional"]
                  ? `\nOutcome: ${s["what-was-the-outcome-of-this-step-optional"]}`
                  : "")
            )
            .join("\n\n"),
          result:
            ex.result?.[
              "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
            ] || ""
        })
      )

      // Build job description string
      const jobDescription = [
        `Role: ${roleName}`,
        `Level: ${roleLevel}`,
        roleDescription ? `Description: ${roleDescription}` : undefined
      ]
        .filter(Boolean)
        .join("\n")

      const numExamples = starExamplesCount || starExamples.length

      // Calculate word counts
      const introWordCount = Math.round(pitchWordLimit * 0.1)
      const conclusionWordCount = Math.round(pitchWordLimit * 0.1)
      const starWordCount = Math.round((pitchWordLimit * 0.8) / numExamples)

      // Make the n8n webhook call
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pitch_id: requestId,
          callback_url: callbackUrl,
          job_description: jobDescription,
          star_examples: formattedStarExamples,
          user_experience: relevantExperience,
          intro_word_count: introWordCount,
          conclusion_word_count: conclusionWordCount,
          star_word_count: starWordCount,
          total_word_limit: pitchWordLimit
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`n8n webhook error: ${errorText}`)
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        requestId, // Return the pitch ID as the requestId
        message: `Pitch generation workflow launched.`
      })
    } catch (error: any) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 504 })
      }
      throw error
    }
  } catch (error: any) {
    console.error("Error requesting pitch generation:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}