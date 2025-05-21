// API route to update pitch content for a specific pitch ID
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { savePitchContentAction } from "@/actions/db/pitches-actions"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    /* 1. Auth */
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pitchId } = await params
    const body = await request.json()
    const content: string = body.pitchContent ?? ""

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid pitchContent" },
        { status: 400 }
      )
    }

    const result = await savePitchContentAction(pitchId, userId, content)

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Pitch content updated",
        data: result.data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("PATCH /api/pitches/[pitchId]/content error:", error)
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    )
  }
}
