// app/api/guidance/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"
import { debugLog } from "@/lib/debug"

export async function POST(req: NextRequest) {
  try {
    // Optional: require shared secret for n8n callbacks
    const expectedAuth = process.env.N8N_CALLBACK_AUTH
    if (expectedAuth) {
      const sent = req.headers.get("authorization")
      if (sent !== expectedAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const data = await req.json()

    // Correlation id / pitch id
    const uniqueId =
      data?.input_variables?.id_unique ??
      data?.output?.data?.id_unique ??
      data?.id_unique ??
      data?.data?.id_unique ??
      data?.requestId ??
      data?.pitch_id ??
      ""

    if (!uniqueId) {
      return NextResponse.json({ error: "No unique ID provided in callback" }, { status: 400 })
    }

    // Guidance text from various shapes: PromptLayer or n8n
    const albertGuidance =
      data?.output?.data?.["AI Guidance"] ??
      data?.data?.["AI Guidance"] ??
      data?.output?.data?.guidance ??
      data?.data?.guidance ??
      data?.guidance ??
      data?.albertGuidance ??
      ""

    if (!albertGuidance) {
      return NextResponse.json({ error: "No guidance text found in callback" }, { status: 400 })
    }

    const res = await updatePitchByExecutionId(uniqueId, { albertGuidance })
    if (!res.isSuccess) {
      return NextResponse.json({ error: res.message }, { status: 500 })
    }

    debugLog(`Guidance saved for ${uniqueId} (${albertGuidance.length} chars)`)
    return NextResponse.json({ success: true, message: "Guidance saved successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
