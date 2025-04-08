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

// Increase the timeout for this route - agent processing takes 3 minutes plus overhead
export const maxDuration = 240 // 4 minutes (240 seconds) to allow for agent processing

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation
    if (
      !body.roleName ||
      !body.roleLevel ||
      !body.pitchWordLimit ||
      !body.yearsExperience ||
      !body.relevantExperience ||
      !body.starExample1
    ) {
      return NextResponse.json(
        { isSuccess: false, message: "Missing required fields for pitch generation" },
        { status: 400 }
      )
    }

    // Call our new agent action instead of the OpenAI action
    const agentResult = await generateAgentPitchAction({
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: Number(body.pitchWordLimit),
      yearsExperience: body.yearsExperience,
      relevantExperience: body.relevantExperience,
      roleDescription: body.roleDescription || "",
      starExample1: body.starExample1,
      starExample2: body.starExample2
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