// Poll for pitch generation completion by execution ID
import { getPitchByExecutionIdAction } from "@/actions/db/pitches-actions"
import { NextRequest, NextResponse } from "next/server"
import { debugLog } from "@/lib/debug"

const RETRY_AFTER_SECONDS = 5

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const executionId = searchParams.get("requestId")

    if (!executionId) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing 'requestId' query parameter"
        },
        { status: 400 }
      )
    }

    const result = await getPitchByExecutionIdAction(executionId)
    debugLog(
      `Polling pitch status for executionId "${executionId}": ${
        result.isSuccess ? "found" : "not found"
      }`
    )

    if (!result.isSuccess) {
      return new NextResponse(
        JSON.stringify({
          status: "pending",
          message: "Pitch not found or still processing"
        }),
        {
          status: 202,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": RETRY_AFTER_SECONDS.toString()
          }
        }
      )
    }

    const pitch = result.data

    if (pitch?.pitchContent) {
      return NextResponse.json({
        status: "completed",
        pitchContent: pitch.pitchContent
      })
    }

    return new NextResponse(
      JSON.stringify({
        status: "pending",
        message: "Pitch is still being generated"
      }),
      {
        status: 202,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": RETRY_AFTER_SECONDS.toString()
        }
      }
    )
  } catch (error: unknown) {
    console.error("Error polling pitch status")

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected error occurred while polling pitch status"

    return NextResponse.json(
      {
        status: "error",
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
