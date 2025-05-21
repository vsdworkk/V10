// Poll for pitch generation completion by execution ID
import { NextRequest, NextResponse } from "next/server"
import { getPitchByExecutionIdAction } from "@/actions/db/pitches-actions"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing requestId parameter" },
        { status: 400 }
      )
    }

    // Note: The requestId is actually the pitch ID
    // getPitchByExecutionIdAction is designed to look up by BOTH agentExecutionId and id fields
    // This is the exact same pattern used by the guidance system
    const result = await getPitchByExecutionIdAction(requestId)
    console.log(
      `Pitch status check for requestId ${requestId}: ${result.isSuccess ? "found" : "not found"}`
    )

    if (!result.isSuccess) {
      return NextResponse.json({
        status: "pending",
        message: "Pitch not found or still processing"
      })
    }

    // If we have pitch content, return it
    if (result.data?.pitchContent) {
      return NextResponse.json({
        status: "completed",
        pitchContent: result.data.pitchContent
      })
    }

    // Otherwise, it's still processing
    return NextResponse.json({
      status: "pending",
      message: "Pitch still processing"
    })
  } catch (error: any) {
    console.error("Error checking pitch status:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
