import { NextRequest, NextResponse } from "next/server"
import { getPitchByExecutionIdAction } from "@/actions/db/pitches-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const execId = searchParams.get("execId")

    if (!execId) {
      return NextResponse.json({ isSuccess: false, message: "Missing execId" }, { status: 400 })
    }

    const result = await getPitchByExecutionIdAction(execId)

    if (!result.isSuccess) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    console.error("Error in GET /api/pitch-by-exec:", err)
    return NextResponse.json(
      { isSuccess: false, message: err.message || "Internal server error" },
      { status: 500 }
    )
  }
} 