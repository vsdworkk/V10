// GET endpoint used by the client to poll for Albert guidance completion.
// Returns the guidance once available or a pending status while processing.
import { NextRequest, NextResponse } from "next/server"
import { getPitchByExecutionIdAction } from "@/actions/db/pitches-actions"
import { debugLog } from "@/lib/debug"

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

    const result = await getPitchByExecutionIdAction(requestId)
    debugLog(
      `Status check for requestId ${requestId}: ${result.isSuccess ? "found" : "not found"}`
    )

    if (!result.isSuccess) {
      return NextResponse.json({
        status: "pending",
        message: "Guidance not found or still processing"
      })
    }

    // If we have guidance, return it
    if (result.data?.albertGuidance) {
      return NextResponse.json({
        status: "completed",
        guidance: result.data.albertGuidance
      })
    }

    // Otherwise, it's still processing
    return NextResponse.json({
      status: "pending",
      message: "Guidance still processing"
    })
  } catch (error) {
    console.error("Error checking guidance status:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    )
  }
}
