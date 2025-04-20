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

    // Additional debug info for input variables if they exist
    const inputVars = payload?.input_variables || {}
    
    console.log("PromptLayer callback received:", {
      mainOutputPreview: typeof mainOutput === "string" 
        ? mainOutput.slice(0, 1000) + (mainOutput.length > 1000 ? "..." : "")
        : mainOutput,
      fieldCount: Object.keys(data).length,
      fieldPreviews,
      inputVariables: inputVars,
      payloadKeys: Object.keys(payload || {})
    })

    // --- 6. Persist the generated pitch back to our DB ----------------------
    // We now expect a custom 6‑digit identifier (`id_unique`) inside one of several
    // possible locations: payload.data.id_unique, payload.input_variables.id_unique,
    // or fallback to PromptLayer execution ID fields.

    let execId: string | undefined =
      // Check in data
      (typeof data["id_unique"] === "string" && data["id_unique"].length > 0
        ? (data["id_unique"] as string)
        // Check in input_variables
        : typeof inputVars?.id_unique === "string" && inputVars.id_unique.length > 0
        ? inputVars.id_unique as string
        // Fallbacks to old PromptLayer fields
        : (payload as any)?.workflow_version_execution_id ||
          (payload as any)?.execution_id ||
          (payload as any)?.workflow_execution_id)
    
    // Final fallback: try to find most recent pitch with similar job description
    if (!execId && typeof data["job_description"] === "string") {
      console.log("No execution ID found, using job description as fallback")
      
      // For now we'll just use a simplified ID approach - the first 6 chars of the description
      const jobDesc = data["job_description"] as string
      if (jobDesc.length >= 10) {
        execId = jobDesc.slice(0, 6) + Math.floor(Math.random() * 1000).toString()
        console.log(`Generated fallback ID from job description: ${execId}`)
      }
    }

    if (typeof execId !== "string" || execId.length === 0) {
      console.error("Could not find execution ID in payload", {
        hasDataIdUnique: typeof data["id_unique"] === "string",
        hasInputVarsIdUnique: typeof inputVars?.id_unique === "string",
        hasWorkflowExecId: typeof (payload as any)?.workflow_version_execution_id === "string",
        hasExecId: typeof (payload as any)?.execution_id === "string",
        hasJobDescription: typeof data["job_description"] === "string"
      })
      throw new Error(
        "Missing execution identifier in callback payload. Could not find id_unique or workflow_version_execution_id."
      )
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