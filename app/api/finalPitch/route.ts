/**
 * @description
 * API route for generating the final pitch text from GPT-4o ("Albert").
 * 
 * Key Features:
 * - Expects role and experience fields (same as guidance, plus STAR examples).
 * - Calls generatePitchAction in "pitch" mode.
 * - Returns the AI-generated pitch in JSON format for the client wizard.
 * 
 * @dependencies
 * - generatePitchAction from "@/actions/ai-actions"
 * - NextResponse for JSON responses
 * 
 * @notes
 * This route is similar to /api/albertGuidance but uses mode="pitch" to get
 * a complete final pitch instead of suggestions. The client can then show an
 * editable text area for the user to refine the content.
 */

import { NextResponse } from "next/server"
import { generatePitchAction } from "@/actions/ai-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation: ensure we have the required fields
    // We allow starExample1/starExample2 if present
    if (
      !body.roleName ||
      !body.roleLevel ||
      !body.pitchWordLimit ||
      !body.yearsExperience ||
      !body.relevantExperience
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Missing required fields for final pitch generation"
        },
        { status: 400 }
      )
    }

    // Prepare the payload for generatePitchAction (mode="pitch")
    const aiResult = await generatePitchAction({
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: Number(body.pitchWordLimit),
      yearsExperience: body.yearsExperience,
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
      starExample1: body.starExample1 || undefined,
      starExample2: body.starExample2 || undefined,
      mode: "pitch"
    })

    if (!aiResult.isSuccess) {
      return NextResponse.json(
        { isSuccess: false, message: aiResult.message },
        { status: 500 }
      )
    }

    // Return the pitch text
    return NextResponse.json(
      { isSuccess: true, message: aiResult.message, data: aiResult.data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in /api/finalPitch POST:", error)
    return NextResponse.json(
      { isSuccess: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}