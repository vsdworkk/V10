// API route to start pitch generation using PromptLayer
import { NextRequest, NextResponse } from "next/server"
import {
  updatePitchByExecutionId,
  getPitchByExecutionIdAction
} from "@/actions/db/pitches-actions"
import { getAvailableCreditsAction } from "@/actions/db/profiles-actions"
import { PitchRequestSchema } from "@/lib/schemas/pitchSchemas"
import { debugLog } from "@/lib/debug"

const REQUEST_TIMEOUT_MS = 60_000
const INTRO_CONCLUSION_RATIO = 0.1
const STAR_RATIO = 0.8

// === Environment Handling ===
function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === "") {
    throw new Error(`Missing or empty environment variable: ${name}`)
  }
  return value
}

const PROMPTLAYER_URL = getRequiredEnvVar("PROMPTLAYER_URL")
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "")

try {
  new URL(BASE_URL!)
} catch {
  throw new Error(`Invalid NEXT_PUBLIC_BASE_URL: ${BASE_URL}`)
}

const callbackUrl = `${BASE_URL}/api/pitches/generate/callback`

const formatStarExamples = (examples: any[]) =>
  examples.map((ex, idx) => ({
    id: String(idx + 1),
    situation: [
      ex.situation?.["where-and-when-did-this-experience-occur"],
      ex.situation?.["briefly-describe-the-situation-or-challenge-you-faced"]
    ]
      .filter(Boolean)
      .join("\n"),
    task: [
      ex.task?.["what-was-your-responsibility-in-addressing-this-issue"],
      ex.task?.["what-constraints-or-requirements-did-you-need-to-consider"]
    ]
      .filter(Boolean)
      .join("\n"),
    action: ex.action?.steps
      ?.map(
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
  }))

const getVersion = (n: number): string => {
  const versions: Record<number, string> = { 2: "v1.2", 3: "v1.3", 4: "v1.4" }
  return versions[n] ?? "v1.2"
}

const triggerPromptLayerWorkflow = async (
  payload: any,
  signal: AbortSignal
) => {
  const apiKey = process.env.PROMPTLAYER_API_KEY
  if (!apiKey) {
    throw new Error("Missing PromptLayer API key")
  }

  const response = await fetch(PROMPTLAYER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey
    },
    body: JSON.stringify(payload),
    signal
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PromptLayer error: ${errorText}`)
  }

  return response.json()
}

// === Main Handler ===
export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const json = await req.json()
    const parsed = PitchRequestSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const {
      userId,
      pitchId,
      roleName,
      organisationName,
      roleLevel,
      pitchWordLimit,
      roleDescription,
      relevantExperience,
      starExamples,
      starExamplesCount
    } = parsed.data

    // Check if pitch already exists
    const existingPitch = await getPitchByExecutionIdAction(pitchId)
    if (existingPitch.isSuccess) {
      return NextResponse.json(
        { error: "Pitch already exists or is in progress" },
        { status: 409 }
      )
    }

    // Check credit availability
    const creditRes = await getAvailableCreditsAction(userId)
    if (!creditRes.isSuccess) {
      return NextResponse.json({ error: creditRes.message }, { status: 500 })
    }

    if (creditRes.data < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      )
    }

    // Create or update pitch record as draft
    const updateResult = await updatePitchByExecutionId(pitchId, {
      agentExecutionId: pitchId,
      status: "draft",
      userId
    })

    if (!updateResult.isSuccess) {
      return NextResponse.json(
        { error: `Failed to update pitch: ${updateResult.message}` },
        { status: 500 }
      )
    }

    debugLog(`Pitch updated with execution ID: ${pitchId}`)

    // Build PromptLayer payload
    const formattedStarExamples = formatStarExamples(starExamples)

    const jobDescription = [`Role: ${roleName}`, `Level: ${roleLevel}`]
    if (roleDescription) {
      jobDescription.push(`Description: ${roleDescription}`)
    }

    const numExamples = starExamplesCount || starExamples.length
    const workflowLabelName = getVersion(numExamples)

    const introWordCount = Math.round(pitchWordLimit * INTRO_CONCLUSION_RATIO)
    const conclusionWordCount = Math.round(
      pitchWordLimit * INTRO_CONCLUSION_RATIO
    )
    const starWordCount = Math.round(
      (pitchWordLimit * STAR_RATIO) / numExamples
    )

    const payload = {
      workflow_label_name: workflowLabelName,
      input_variables: {
        job_description: jobDescription.join("\n"),
        star_components: JSON.stringify({
          starExamples: formattedStarExamples
        }),
        Star_Word_Count: starWordCount.toString(),
        User_Experience: relevantExperience,
        Intro_Word_Count: introWordCount.toString(),
        Conclusion_Word_Count: conclusionWordCount.toString(),
        ILS: "Isssdsd",
        id_unique: pitchId
      },
      metadata: {
        source: "webapp",
        callback_url: callbackUrl
      },
      return_all_outputs: true
    }

    // Trigger PromptLayer generation
    try {
      await triggerPromptLayerWorkflow(payload, controller.signal)

      return NextResponse.json({
        success: true,
        requestId: pitchId,
        message: `Agent version ${workflowLabelName} launched.`
      })
    } catch (error: any) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 504 })
      }

      console.error(
        `PromptLayer request failed for userId=${userId}, pitchId=${pitchId}:`,
        error
      )
      return NextResponse.json(
        { error: error.message || "Failed to trigger PromptLayer" },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error("Unhandled error in pitch generation route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
