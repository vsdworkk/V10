/**
 * @description
 * API route for generating the final pitch text using our custom agent.
 */
import { NextResponse } from "next/server"
import { generateAgentPitchAction } from "@/actions/agent-actions"

export const maxDuration = 180 // 180 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation: ensure we have the minimum required fields.
    // Removed any reference to yearsExperience.
    if (
      !body.roleName ||
      !body.roleLevel ||
      !body.pitchWordLimit ||
      !body.relevantExperience ||
      !Array.isArray(body.starExamples) ||
      body.starExamples.length === 0
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message:
            "Missing required fields for pitch generation (including at least one STAR example)."
        },
        { status: 400 }
      )
    }

    // Convert pitchWordLimit to a number
    const numericLimit = Number(body.pitchWordLimit)

    // Log the inputs being sent to the agent action
    console.log("Generating agent pitch with inputs:", {
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: numericLimit,
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
      starExamples: body.starExamples
    });

    // Call our new agent action
    const agentResult = await generateAgentPitchAction({
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: numericLimit,
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
      // Now pass the array of starExamples
      starExamples: body.starExamples
    })

    if (!agentResult.isSuccess) {
      return NextResponse.json(
        { isSuccess: false, message: agentResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { isSuccess: true, message: agentResult.message, data: agentResult.data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in /api/finalPitch POST:", error)

    if (
      error.message?.includes("timeout") ||
      error.name === "AbortError" ||
      error.code === "ETIMEDOUT"
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message:
            "The request took too long to process. Please try again or shorten the request."
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