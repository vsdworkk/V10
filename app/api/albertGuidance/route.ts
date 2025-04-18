/**
 * @description
 * API route for generating Albert's guidance suggestions.
 * Expects a JSON payload with:
 *  - roleName
 *  - roleLevel
 *  - pitchWordLimit
 *  - relevantExperience
 *  - (optional) roleDescription
 *
 * Returns an ActionState-like JSON with { isSuccess, message, data? }.
 */
import { NextResponse } from "next/server"
import { generatePitchAction } from "@/actions/ai-actions"

export const maxDuration = 55 // 55 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation
    if (!body.roleName || !body.roleLevel || !body.pitchWordLimit || !body.relevantExperience) {
      return NextResponse.json(
        { isSuccess: false, message: "Missing required fields for guidance" },
        { status: 400 }
      )
    }

    // Call generatePitchAction with mode="guidance"
    const aiResult = await generatePitchAction({
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: Number(body.pitchWordLimit),
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
      mode: "guidance"
    })

    if (!aiResult.isSuccess) {
      return NextResponse.json({ isSuccess: false, message: aiResult.message }, { status: 500 })
    }

    return NextResponse.json(
      { isSuccess: true, message: aiResult.message, data: aiResult.data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in /api/albertGuidance POST:", error)

    if (
      error.message?.includes("timeout") ||
      error.name === "AbortError" ||
      error.code === "ETIMEDOUT"
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message:
            "The request took too long to process. Please try again or use a shorter description."
        },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { isSuccess: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}