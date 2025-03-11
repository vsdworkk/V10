/**
 * @description
 * An API route that handles the creation or update of a pitch record.
 * The client wizard sends a POST request with the entire pitch data as JSON.
 * If the request includes an 'id' field, it updates the existing pitch.
 * Otherwise, it creates a new pitch.
 *
 * Key Features:
 * - Reads request JSON for pitch fields
 * - Calls createPitchAction or updatePitchAction based on presence of 'id'
 * - Returns 200 on success, 400 or 500 on error
 *
 * @dependencies
 * - createPitchAction and updatePitchAction from "@/actions/db/pitches-actions"
 * - Next.js "NextResponse" for JSON responses
 *
 * @notes
 * - We do not do AI generation here, purely storing data as draft or final
 */

import { NextResponse } from "next/server"
import { createPitchAction, updatePitchAction } from "@/actions/db/pitches-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate minimal fields. (In an advanced scenario, we might replicate
    // the Zod schema logic or rely on the wizard's own validation.)
    if (!body.userId || !body.roleName || !body.roleLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prepare data for create/update
    const pitchData = {
      userId: body.userId,
      roleName: body.roleName,
      organisationName: body.organisationName || null,
      roleLevel: body.roleLevel,
      pitchWordLimit: body.pitchWordLimit || 500,
      roleDescription: body.roleDescription || "",
      yearsExperience: body.yearsExperience || "",
      relevantExperience: body.relevantExperience || "",
      resumePath: body.resumePath || null,
      starExample1: body.starExample1 || null,
      starExample2: body.starExample2 || null,
      albertGuidance: body.albertGuidance || "",
      pitchContent: body.pitchContent || "",
      status: body.status || "draft"
    }

    let result;

    // If an ID is provided, update the existing pitch
    if (body.id) {
      result = await updatePitchAction(body.id, pitchData, body.userId)
      
      if (!result.isSuccess) {
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        message: "Pitch updated", 
        data: result.data 
      }, { status: 200 })
    } 
    // Otherwise, create a new pitch
    else {
      result = await createPitchAction(pitchData)
      
      if (!result.isSuccess) {
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        message: "Pitch created", 
        data: result.data 
      }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error in /api/pitchWizard POST:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}