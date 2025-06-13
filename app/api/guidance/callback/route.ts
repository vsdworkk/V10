// Callback endpoint for AI guidance workflow
import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"
import { debugLog } from "@/lib/debug"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Extract the unique ID and AI guidance text
    let uniqueId = ""

    // Check common locations for the ID
    if (data.input_variables?.id_unique) {
      uniqueId = data.input_variables.id_unique
    } else if (data.output?.data?.id_unique) {
      uniqueId = data.output.data.id_unique
    } else if (data.id_unique) {
      uniqueId = data.id_unique
    } else if (data.data?.id_unique) {
      uniqueId = data.data.id_unique
    }

    if (!uniqueId) {
      console.error("No unique ID found in callback data", data)
      return NextResponse.json(
        { error: "No unique ID provided in callback" },
        { status: 400 }
      )
    }

    // Extract the guidance text
    let albertGuidance = ""
    if (data.output?.data?.["AI Guidance"]) {
      albertGuidance = data.output.data["AI Guidance"]
    } else if (data.data?.["AI Guidance"]) {
      albertGuidance = data.data["AI Guidance"]
    }

    if (!albertGuidance) {
      console.error("No guidance text found in callback data", data)
      return NextResponse.json(
        { error: "No guidance text found in callback" },
        { status: 400 }
      )
    }

    // Update the database
    debugLog(
      `Updating pitch with execution ID ${uniqueId} and guidance text (${albertGuidance.length} chars)`
    )
    const updateResult = await updatePitchByExecutionId(uniqueId, {
      albertGuidance
    })

    if (!updateResult.isSuccess) {
      console.error(`Failed to update pitch: ${updateResult.message}`)
      return NextResponse.json({ error: updateResult.message }, { status: 500 })
    }

    debugLog("Guidance saved successfully")
    return NextResponse.json({
      success: true,
      message: "Guidance saved successfully"
    })
  } catch (error) {
    console.error("Error processing guidance callback:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
