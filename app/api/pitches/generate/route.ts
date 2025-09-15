// app/api/pitches/generate/route.ts
// API route to start pitch generation using n8n
import { NextRequest, NextResponse } from "next/server"
import {
  updatePitchByExecutionId,
  getPitchByExecutionIdAction
} from "@/actions/db/pitches-actions"
import { getAvailableCreditsAction } from "@/actions/db/profiles-actions"
import { PitchRequestSchema } from "@/lib/schemas/pitchSchemas"
import { debugLog } from "@/lib/debug"

const REQUEST_TIMEOUT_MS = 60_000
const INTRO_RATIO = 0.1
const STAR_RATIO = 0.78
const CONCLUSION_RATIO = 0.07

// === BASE URL + callback ===
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "")
try {
  new URL(BASE_URL!)
} catch {
  throw new Error(`Invalid NEXT_PUBLIC_BASE_URL: ${BASE_URL}`)
}
const callbackUrl = `${BASE_URL}/api/pitches/generate/callback`

// === Helpers ===
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

// === Main Handler ===
export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let requestId: string | null = null

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
      starExamplesCount,
      albertGuidance
    } = parsed.data

    requestId = pitchId

    // If pitch exists and not draft/failed, short-circuit
    const existingPitch = await getPitchByExecutionIdAction(pitchId)
    if (existingPitch.isSuccess && existingPitch.data) {
      const status = existingPitch.data.status
      if (status !== "draft" && status !== "failed") {
        return NextResponse.json(
          { error: "Generation already in progress or completed." },
          { status: 409 }
        )
      }
    }

    // Credit check
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

    // Mark in-progress
    {
      const res = await updatePitchByExecutionId(pitchId, {
        agentExecutionId: pitchId,
        status: "draft",
        userId
      })
      if (!res.isSuccess) {
        return NextResponse.json(
          { error: `Failed to update pitch: ${res.message}` },
          { status: 500 }
        )
      }
      debugLog(`Pitch updated with execution ID: ${pitchId}`)
    }

    // n8n webhook
    const webhookUrl = process.env.N8N_PITCH_WEBHOOK_URL
    if (!webhookUrl) {
      try {
        await updatePitchByExecutionId(pitchId, { agentExecutionId: null })
      } catch {}
      return NextResponse.json(
        { error: "N8N webhook URL not configured" },
        { status: 500 }
      )
    }

    // Build payload
    const formattedStarExamples = formatStarExamples(starExamples)
    const jobDescriptionParts = [`Role: ${roleName}`, `Level: ${roleLevel}`]
    if (roleDescription)
      jobDescriptionParts.push(`Description: ${roleDescription}`)
    const numExamples = starExamplesCount || starExamples.length || 1
    const introWordCount = Math.round(pitchWordLimit * INTRO_RATIO)
    const conclusionWordCount = Math.round(pitchWordLimit * CONCLUSION_RATIO)
    const starWordCount = Math.round(
      (pitchWordLimit * STAR_RATIO) / numExamples
    )

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id_unique: pitchId,
        user_id: userId,
        pitch_id: pitchId,
        role_name: roleName,
        organisation_name: organisationName ?? null,
        role_level: roleLevel,
        word_limit: pitchWordLimit,
        job_description: jobDescriptionParts.join("\n"),
        user_experience: relevantExperience ?? "",
        ai_guidance: albertGuidance ?? "",
        star_examples: formattedStarExamples,
        star_count: numExamples,
        Intro_Word_Count: introWordCount,
        Conclusion_Word_Count: conclusionWordCount,
        Star_Word_Count: starWordCount,
        callback_url: callbackUrl,
        source: "webapp"
      }),
      signal: controller.signal
    })

    if (!upstream.ok) {
      try {
        await updatePitchByExecutionId(pitchId, { agentExecutionId: null })
      } catch {}
      const text = await upstream.text()
      return NextResponse.json(
        { error: `n8n webhook error: ${text}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requestId: pitchId,
      message: "Pitch generation request initiated"
    })
  } catch (error: any) {
    try {
      if (requestId)
        await updatePitchByExecutionId(requestId, { agentExecutionId: null })
    } catch {}
    if (error?.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 })
    }
    console.error("Error requesting pitch generation:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
