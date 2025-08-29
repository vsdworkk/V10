// app/api/guidance/route.ts
import { NextRequest, NextResponse } from "next/server"
import {
  updatePitchByExecutionId,
  getPitchByIdAction,
} from "@/actions/db/pitches-actions"
import { debugLog } from "@/lib/debug"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  let requestId: string | null = null

  try {
    const { userId: currentUserId } = await auth()
    const { jobDescription, experience, userId, pitchId } = await req.json()

    if (!jobDescription || !experience || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (currentUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!pitchId) {
      return NextResponse.json(
        { error: "Missing pitchId - a pitch must be created before requesting guidance" },
        { status: 400 }
      )
    }

    // Use pitchId as the long-running request correlation id
    requestId = pitchId

    // If guidance already present or in progress, short-circuit
    const existing = await getPitchByIdAction(pitchId, userId)
    if (existing.isSuccess && existing.data) {
      if (existing.data.albertGuidance) {
        return NextResponse.json({
          success: true,
          requestId: existing.data.agentExecutionId || requestId,
          message: "Guidance already generated",
          guidance: existing.data.albertGuidance,
        })
      }
      if (existing.data.agentExecutionId) {
        return NextResponse.json({
          success: true,
          requestId: existing.data.agentExecutionId,
          message: "Guidance request already in progress",
        })
      }
    }

    // Mark in-progress before calling external service
    if (!requestId) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }
    {
      const res = await updatePitchByExecutionId(requestId, { agentExecutionId: requestId })
      if (!res.isSuccess) {
        return NextResponse.json(
          { error: `Failed to update pitch: ${res.message}` },
          { status: 500 }
        )
      }
      debugLog(`Successfully updated pitch with execution ID: ${requestId}`)
    }

    // n8n webhook
    const webhookUrl = process.env.N8N_GUIDANCE_WEBHOOK_URL
    if (!webhookUrl) {
      try {
        await updatePitchByExecutionId(requestId, { agentExecutionId: null })
      } catch {}
      return NextResponse.json({ error: "N8N webhook URL not configured" }, { status: 500 })
    }

    const callbackUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
    }/api/guidance/callback`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      // Optional: bearer/basic token for protected n8n webhook
      if (process.env.N8N_WEBHOOK_AUTH) {
        headers.Authorization = process.env.N8N_WEBHOOK_AUTH
      }

      const upstream = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_unique: requestId,
          job_description: jobDescription,
          user_experience: experience,
          user_id: userId,
          pitch_id: pitchId,
          callback_url: callbackUrl,
          source: "webapp",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!upstream.ok) {
        try {
          await updatePitchByExecutionId(requestId, { agentExecutionId: null })
        } catch {}
        const text = await upstream.text()
        return NextResponse.json({ error: `n8n webhook error: ${text}` }, { status: 500 })
      }

      // Success: keep agentExecutionId set; callback will populate albertGuidance
      return NextResponse.json({
        success: true,
        requestId,
        message: "Guidance request initiated",
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      try {
        await updatePitchByExecutionId(requestId, { agentExecutionId: null })
      } catch {}
      if (error?.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 504 })
      }
      return NextResponse.json(
        { error: error?.message || "Failed to initiate guidance request" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    try {
      if (requestId) await updatePitchByExecutionId(requestId, { agentExecutionId: null })
    } catch {}
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
