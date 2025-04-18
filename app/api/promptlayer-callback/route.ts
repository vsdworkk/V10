"use server"

import { NextResponse } from "next/server"

/**
 * POST /api/promptlayer-callback
 *
 * PromptLayer will POST the final agent results to this endpoint when the execution is complete.
 * The expected JSON payload (based on PromptLayer docs) might look like:
 * {
 *   "workflow_version_execution_id": 12345,
 *   "output": "...final string result...",
 *   "all_outputs": { ... } // if return_all_outputs=true
 * }
 *
 * For now, we simply log the results. In a production scenario you might store them in the DB
 * (e.g., associate with a pending record keyed by execution_id) or notify the frontend via websockets.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const {
      workflow_version_execution_id: executionId,
      output,
      all_outputs: allOutputs
    } = payload || {}

    console.log("PromptLayer callback received:", {
      executionId,
      outputPreview: typeof output === "string" ? output.slice(0, 200) : output,
      allOutputs: allOutputs ? "included" : "not provided"
    })

    // TODO: Persist the result in DB if needed

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error parsing PromptLayer callback payload", err)
    return new NextResponse("Invalid payload", { status: 400 })
  }
} 