/**
 * @description
 * An API route that handles creating or updating a pitch record. 
 * Expects a JSON body with the relevant fields.
 */

import { NextResponse } from "next/server"
import { createPitchAction, updatePitchAction } from "@/actions/db/pitches-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Minimal checks for required fields
    if (!body.userId || !body.roleName || !body.roleLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // starExamples is an array of objects, starExamplesCount is a number
    const pitchData = {
      userId: body.userId,
      roleName: body.roleName,
      organisationName: body.organisationName || null,
      roleLevel: body.roleLevel,
      pitchWordLimit: body.pitchWordLimit || 650,
      roleDescription: body.roleDescription || "",
      yearsExperience: body.yearsExperience || "",
      relevantExperience: body.relevantExperience || "",
      resumePath: body.resumePath || null,

      // The new field storing an array of starSchema objects
      starExamples: body.starExamples || [],

      albertGuidance: body.albertGuidance || "",
      pitchContent: body.pitchContent || "",
      status: body.status || "draft",
      
      // This can be 1..10 or more, depending on your wizard
      starExamplesCount: body.starExamplesCount
        ? parseInt(body.starExamplesCount, 10)
        : 1,

      // Track which step the user is on
      currentStep: body.currentStep || 1
    }

    let result

    // If an ID is provided, we update
    if (body.id) {
      result = await updatePitchAction(body.id, pitchData, body.userId)
      if (!result.isSuccess) {
        return NextResponse.json({ error: result.message }, { status: 500 })
      }
      return NextResponse.json({ message: "Pitch updated", data: result.data })
    } 
    // Otherwise, create a new pitch
    else {
      result = await createPitchAction(pitchData)
      if (!result.isSuccess) {
        return NextResponse.json({ error: result.message }, { status: 500 })
      }
      return NextResponse.json({ message: "Pitch created", data: result.data })
    }
  } catch (error: any) {
    console.error("Error in /api/pitchWizard POST:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}