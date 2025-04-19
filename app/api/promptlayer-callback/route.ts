import { NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"

/**
 * POST /api/promptlayer-callback
 *
 * PromptLayer calls this URL when a workflow execution finishes.
 * The data is structured as a dictionary of named outputs in payload.data.
 * We specifically extract the "Integration Prompt" as our main output,
 * while still logging all fields received.
 */
export async function POST(request: Request) {
  try {
    // --- 1. Read raw body ---------------------------------------------------
    const payload = await request.json()

    // --- 2. Extract data fields from PromptLayer payload --------------------
    const data = payload?.data

    if (!data || typeof data !== 'object') {
      throw new Error("Missing or invalid data structure in payload")
    }

    // --- 3. Extract the main output from Integration Prompt -----------------
    const mainOutput = data["Integration Prompt"]
    
    // --- 4. Debug: print full payload once in dev ---------------------------
    if (process.env.NODE_ENV !== "production") {
      console.dir(payload, { depth: null })
    }

    // --- 5. Log a concise summary of fields ---------------------------------
    const fieldPreviews: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      fieldPreviews[key] = typeof value === "string" 
        ? value.slice(0, 50) + (value.length > 50 ? "..." : "") 
        : value
    }

    console.log("PromptLayer callback received:", {
      mainOutputPreview: typeof mainOutput === "string" 
        ? mainOutput.slice(0, 1000) + (mainOutput.length > 1000 ? "..." : "")
        : mainOutput,
      fieldCount: Object.keys(data).length,
      fieldPreviews
    })

    // --- 6. Persist the generated pitch back to our DB ----------------------
    // PromptLayer includes the execution‑ID at the top level of the payload
    // (field name: `workflow_version_execution_id`). We stored the same id in
    // `pitches.agent_execution_id` when launching the agent, so we can now
    // look up the draft row and update its `pitch_content` field.

    const execId: string | undefined =
      (payload as any)?.workflow_version_execution_id ??
      (payload as any)?.execution_id ??
      (payload as any)?.workflow_execution_id

    if (typeof execId !== "string" || execId.length === 0) {
      throw new Error("Missing workflow_version_execution_id in callback payload")
    }

    // Ensure we only attempt the DB update when we have actual content.
    if (typeof mainOutput === "string" && mainOutput.trim().length > 0) {
      const updateRes = await updatePitchByExecutionId(execId, {
        pitchContent: mainOutput.trim(),
        status: "final" // Optional: mark as final so UI shows correct status
      })

      if (!updateRes.isSuccess) {
        console.error("Failed to update pitch for execId", execId, updateRes.message)
      }
    } else {
      console.warn("No Integration Prompt content found for execId", execId)
    }

    return NextResponse.json({
      success: true,
      executionId: execId,
      output: mainOutput // Echo back the main output for debugging
    })
  } catch (err) {
    console.error("Error parsing PromptLayer callback payload:", err)
    return new NextResponse("Invalid payload", { status: 400 })
  }
}