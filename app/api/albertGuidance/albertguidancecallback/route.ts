import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"

/**
 * This is the callback that PromptLayer calls 
 * after the "AI Guidance" workflow finishes.
 *
 * It extracts the `id_unique` from the payload 
 * and uses that to find/update the correct pitch in DB.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    console.log("Received AlbertGuidance callback:", JSON.stringify(data).slice(0, 250), "...")

    // Attempt to locate the unique ID in the payload
    let uniqueId = ""

    // Check input_variables first
    if (data.input_variables && typeof data.input_variables === "object") {
      if (data.input_variables.id_unique) {
        uniqueId = data.input_variables.id_unique
      }
    }

    // Check if data.output has a `id_unique`
    if (!uniqueId && data.output && data.output.data) {
      if (typeof data.output.data.id_unique === "string") {
        uniqueId = data.output.data.id_unique
      }
    }

    // Or check top-level
    if (!uniqueId && typeof data.id_unique === "string") {
      uniqueId = data.id_unique
    }

    // Check if it's in data.data
    if (!uniqueId && data.data && typeof data.data.id_unique === "string") {
      uniqueId = data.data.id_unique;
    }

    if (!uniqueId) {
      console.error("Missing unique ID in callback payload:", data)
      return NextResponse.json(
        { error: "No unique id_unique provided in callback." },
        { status: 400 }
      )
    }

    // Extract the final "AI Guidance" text, if present
    let albertGuidance = ""
    if (data.output && typeof data.output === "object") {
      if (data.output.data && typeof data.output.data["AI Guidance"] === "string") {
        albertGuidance = data.output.data["AI Guidance"]
      } else {
        // fallback to dumping the entire output object
        albertGuidance = JSON.stringify(data.output, null, 2)
      }
    }
    
    // Check if it's in data.data
    if (!albertGuidance && data.data && typeof data.data["AI Guidance"] === "string") {
      albertGuidance = data.data["AI Guidance"]
    }

    if (!albertGuidance) {
      console.error("No 'AI Guidance' found in callback payload.")
      return NextResponse.json(
        { error: "No guidance text found in callback." },
        { status: 400 }
      )
    }

    // Now update the pitch in DB using updatePitchByExecutionId
    const updateResult = await updatePitchByExecutionId(uniqueId, {
      albertGuidance
    })

    if (!updateResult.isSuccess) {
      console.error("Failed to update pitch:", updateResult.message)
      return NextResponse.json(
        { error: updateResult.message },
        { status: 500 }
      )
    }

    console.log(`Successfully updated pitch ${updateResult.data?.id} with new guidance.`)
    return NextResponse.json({
      success: true,
      message: "Guidance saved successfully",
      pitchId: updateResult.data?.id
    })
  } catch (error: any) {
    console.error("Error in albertGuidance callback route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}