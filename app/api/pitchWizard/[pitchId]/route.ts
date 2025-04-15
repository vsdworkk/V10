"use server"
/**
 * @description
 * A consolidated API route for updating an existing pitch by ID. 
 * It replaces any duplication between pitchWizard/[pitchId]/route.ts and 
 * pitches/[pitchId]/route.ts. 
 *
 * Expects a PATCH request with a JSON body containing the pitch data. 
 * We enforce user ownership using Clerk (auth).
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updatePitchAction } from "@/actions/db/pitches-actions"
// Import your updated pitch schema from wherever it's defined
import { updatePitchSchema } from "@/lib/schemas/pitchSchemas"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract the pitchId from the route parameters
    const { pitchId } = await params
    console.log(`PATCH /api/pitchWizard/${pitchId}: Processing update request`)

    // Parse request body
    const body = await request.json()

    // Ensure the correct user is attached to the payload
    body.userId = userId

    // Validate against the updated schema (no references to old fields)
    try {
      updatePitchSchema.parse(body)
    } catch (err) {
      console.error(`Validation error:`, err)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    console.log(`PATCH /api/pitchWizard/${pitchId}: Calling updatePitchAction`)
    const result = await updatePitchAction(pitchId, body, userId)

    if (!result.isSuccess) {
      console.error(`Update failed:`, result.message)
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    console.log(`Update successful`)
    return NextResponse.json({
      message: "Pitch updated successfully",
      data: result.data
    })
  } catch (error: any) {
    console.error("Error in PATCH /api/pitchWizard/[pitchId]:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}