import { NextRequest, NextResponse } from "next/server"

/**
 * This endpoint receives:
 *    jobDescription, experience, idUnique (optional)
 *
 * Then calls PromptLayer's "AI Guidance" workflow, 
 * sending `id_unique` in the input so the callback 
 * can contain it for matching with our DB record.
 */
export async function POST(req: NextRequest) {
  try {
    const { jobDescription, experience, idUnique } = await req.json()

    if (!jobDescription || !experience) {
      return NextResponse.json(
        { error: "Job description and experience are required" },
        { status: 400 }
      )
    }

    // If no unique ID was provided, we can generate a fallback
    const uniqueId = idUnique || Math.floor(100000 + Math.random() * 900000).toString()

    const promptLayerApiKey = process.env.AGENT_API_KEY
    if (!promptLayerApiKey) {
      return NextResponse.json(
        { error: "PromptLayer API key not configured" },
        { status: 500 }
      )
    }

    // For demonstration: "AI Guidance" workflow at promptlayer
    // We'll pass `id_unique` in the input variables
    const callbackUrl = process.env.ALBERTGUIDANCE_CALLBACK_URL 
      || "/api/albertGuidance/albertguidancecallback"

    const response = await fetch(
      "https://api.promptlayer.com/workflows/AI Guidance/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": promptLayerApiKey,
        },
        body: JSON.stringify({
          workflow_label_name: "v1", 
          input_variables: {
            job_description: jobDescription,
            User_Experience: experience,
            id_unique: uniqueId
          },
          metadata: {
            source: "webapp",
            callback_url: callbackUrl
          },
          return_all_outputs: false
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to call PromptLayer agent", details: data },
        { status: response.status }
      )
    }

    // Return our unique ID so the frontend can store it
    return NextResponse.json({
      success: true,
      data: uniqueId,
      message: "Agent execution started successfully"
    })
  } catch (error: any) {
    console.error("Error calling PromptLayer agent:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
