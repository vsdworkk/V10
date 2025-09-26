import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updateInterviewSessionAction } from "@/actions/db/interview-sessions-actions"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, replicaId, personaId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Get session details to build conversational context
    const { getInterviewSessionByIdAction } = await import(
      "@/actions/db/interview-sessions-actions"
    )
    const sessionResult = await getInterviewSessionByIdAction(sessionId, userId)

    if (!sessionResult.isSuccess) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const session = sessionResult.data

    // Use environment variables with fallbacks
    const finalReplicaId =
      replicaId || process.env.TAVUS_REPLICA_ID || "rfe12d8b9597"
    const finalPersonaId =
      personaId || process.env.TAVUS_PERSONA_ID || "pdced222244b"

    // Build conversational context from session details
    const buildConversationalContext = (session: any) => {
      let context = `You are conducting an interview for the position of ${session.jobTitle}`

      if (session.companyName) {
        context += ` at ${session.companyName}`
      }

      context += `. This is a ${session.interviewType} interview`

      if (session.duration) {
        context += ` scheduled for ${session.duration} minutes`
      }

      if (session.jobDescription) {
        context += `.\n\nJob Description:\n${session.jobDescription}`
      }

      if (session.customInstructions) {
        context += `\n\nSpecial Instructions:\n${session.customInstructions}`
      }

      context += `\n\nPlease conduct a professional interview, ask relevant questions based on the job requirements, and provide a supportive yet thorough evaluation of the candidate's qualifications and fit for this role.`

      return context
    }

    const conversationalContext = buildConversationalContext(session)

    // Build callback URL for receiving Tavus webhooks
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ai-interviewer/webhooks/tavus`

    // Create conversation with Tavus API
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.TAVUS_API_KEY || ""
      },
      body: JSON.stringify({
        replica_id: finalReplicaId,
        persona_id: finalPersonaId,
        conversational_context: conversationalContext,
        conversation_name: `Interview: ${session.jobTitle}${session.companyName ? ` at ${session.companyName}` : ""}`,
        callback_url: callbackUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Tavus API error:", errorData)
      return NextResponse.json(
        { error: "Failed to create conversation with Tavus" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const { conversation_id, conversation_url } = data

    // Update the interview session with Tavus conversation details
    const updateResult = await updateInterviewSessionAction(sessionId, {
      conversationId: conversation_id,
      conversationUrl: conversation_url,
      replicaId: finalReplicaId,
      personaId: finalPersonaId
    })

    if (!updateResult.isSuccess) {
      return NextResponse.json({ error: updateResult.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      conversation_id,
      conversation_url,
      message: "Conversation created successfully"
    })
  } catch (error) {
    console.error("Error creating Tavus conversation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
