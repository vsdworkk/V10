/**
 * @description
 * API route for generating Albert's guidance suggestions.
 * Expects a JSON payload with roleName, roleLevel, pitchWordLimit,
 * yearsExperience, relevantExperience, and optional roleDescription.
 * Passes them to generatePitchAction with mode = "guidance".
 *
 * Key Features:
 * - Returns an ActionState-like JSON with { isSuccess, message, data? }
 * - On success, data contains the guidance text
 *
 * @dependencies
 * - generatePitchAction from "@/actions/ai-actions"
 * - NextResponse for JSON responses
 *
 * @notes
 * Used by the GuidanceStep client component to fetch suggestions.
 */

import { NextResponse } from "next/server"
import { generatePitchAction } from "@/actions/ai-actions"

// Increase the timeout for this route
export const maxDuration = 55 // 5 minutes in seconds

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation
    if (
      !body.roleName ||
      !body.roleLevel ||
      !body.pitchWordLimit ||
      !body.yearsExperience ||
      !body.relevantExperience
    ) {
      return NextResponse.json(
        { isSuccess: false, message: "Missing required fields for guidance" },
        { status: 400 }
      )
    }

    // We call generatePitchAction with mode="guidance"
    const aiResult = await generatePitchAction({
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: Number(body.pitchWordLimit),
      yearsExperience: body.yearsExperience,
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
      // We do not need starExample1 or starExample2 for basic guidance
      // so we skip them or pass empty placeholders
      mode: "guidance"
    })

    if (!aiResult.isSuccess) {
      return NextResponse.json(
        { isSuccess: false, message: aiResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { isSuccess: true, message: aiResult.message, data: aiResult.data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in /api/albertGuidance POST:", error)
    
    // Check for timeout errors
    if (error.message?.includes('timeout') || error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          isSuccess: false, 
          message: "The request took too long to process. Please try again or use a shorter description." 
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