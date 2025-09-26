import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { processInterviewAnalysisAction } from "@/actions/ai-interviewer-analysis-actions"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Log the webhook for debugging
    console.log("Tavus webhook received:", {
      event_type: body.event_type,
      conversation_id: body.conversation_id,
      timestamp: body.timestamp
    })

    // Handle different webhook event types
    switch (body.event_type) {
      case "application.transcription_ready":
        await handleTranscriptWebhook(body)
        break

      case "application.perception_analysis":
        await handleVisualAnalysisWebhook(body)
        break

      default:
        console.log("Unknown webhook event type:", body.event_type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Tavus webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleTranscriptWebhook(webhookData: any) {
  try {
    const { conversation_id, properties } = webhookData
    const transcript = properties.transcript

    // Process the transcript and trigger analysis
    await processInterviewAnalysisAction({
      conversationId: conversation_id,
      type: "transcript",
      data: {
        transcript,
        rawWebhookData: webhookData
      }
    })

    console.log(`Transcript processed for conversation: ${conversation_id}`)
  } catch (error) {
    console.error("Error handling transcript webhook:", error)
    throw error
  }
}

async function handleVisualAnalysisWebhook(webhookData: any) {
  try {
    const { conversation_id, properties } = webhookData
    const analysis = properties.analysis

    // Process the visual analysis
    await processInterviewAnalysisAction({
      conversationId: conversation_id,
      type: "visual_analysis",
      data: {
        analysis,
        rawWebhookData: webhookData
      }
    })

    console.log(
      `Visual analysis processed for conversation: ${conversation_id}`
    )
  } catch (error) {
    console.error("Error handling visual analysis webhook:", error)
    throw error
  }
}
