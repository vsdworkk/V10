/**
 * @description
 * API route for generating the final pitch text using our custom agent.
 * 
 * Key Features:
 * - Expects role and experience fields (same as before).
 * - Calls generateAgentPitchAction to use our custom agent instead of OpenAI.
 * - Returns the agent-generated pitch in JSON format for the client wizard.
 * 
 * @dependencies
 * - generateAgentPitchAction from "@/actions/agent-actions"
 * - NextResponse for JSON responses
 * 
 * @notes
 * This route replaces the previous implementation that used OpenAI's API directly.
 * The client-side code remains unchanged as the response format is the same.
 */

import { NextResponse } from "next/server"
import { generateAgentPitchAction } from "@/actions/agent-actions"

// Increase the timeout for this route - agent processing can take 150s or more
export const maxDuration = 180 // 180 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation: ensure we have the minimum required fields.
    // Now we check for starExamples (array) instead of starExample1/starExample2.
    if (
      !body.roleName ||
      !body.roleLevel ||
      !body.pitchWordLimit ||
      !body.yearsExperience ||
      !body.relevantExperience ||
      !Array.isArray(body.starExamples) ||
      body.starExamples.length === 0
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Missing required fields for pitch generation (including at least one STAR example)."
        },
        { status: 400 }
      )
    }

    // Convert pitchWordLimit to a number just in case it's passed as a string
    const numericLimit = Number(body.pitchWordLimit)

    // Call our new agent action instead of the OpenAI action.
    // We pass the array of starExamples plus other relevant data.
    const agentResult = await generateAgentPitchAction({
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: numericLimit,
      yearsExperience: body.yearsExperience,
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
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

    // Check for timeout-related errors
    if (
      error.message?.includes("timeout") ||
      error.name === "AbortError" ||
      error.code === "ETIMEDOUT"
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "The request took too long to process. Please try again or shorten the request."
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