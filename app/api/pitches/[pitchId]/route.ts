"use server"
/**
 * @description
 * An API route for updating an existing pitch by ID. Expects a PATCH request.
 * The request body should contain updated pitch data. We enforce user ownership.
 * This simplified version is primarily used for updating the albertGuidance field.
 *
 * Key features:
 * - Checks if user is authenticated
 * - Calls updatePitchAction from pitches-actions
 * - Returns JSON with either success or error
 *
 * @dependencies
 * - auth from "@clerk/nextjs/server" for verifying the user
 * - NextResponse from "next/server" for returning JSON
 * - updatePitchAction from "@/actions/db/pitches-actions"
 *
 * @notes
 * The route is accessible at /api/pitches/[pitchId] for PATCH requests.
 * Example usage:
 *   fetch("/api/pitches/<pitchId>", {
 *     method: "PATCH",
 *     body: JSON.stringify({...}),
 *   })
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updatePitchAction } from "@/actions/db/pitches-actions"
import { z } from "zod"

/**
 * A minimal schema for updating the albertGuidance field.
 */
const updatePitchSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().optional(),
  albertGuidance: z.string().optional()
})

/**
 * A dynamic route handler for /api/pitches/[pitchId].
 * We only define a PATCH method here to handle pitch updates.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Extract the pitchId from params
    const { pitchId } = await params
    
    console.log(`PATCH /api/pitches/${pitchId}: Processing update request`);
    
    // Parse the request body
    const body = await request.json()
    
    // Ensure user ID is set correctly (enforce ownership)
    body.userId = userId
    
    // Validate the request body
    try {
      updatePitchSchema.parse(body)
    } catch (err) {
      console.error(`PATCH /api/pitches/${pitchId}: Validation error:`, err);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    
    console.log(`PATCH /api/pitches/${pitchId}: Calling updatePitchAction`);
    
    // Call our server action to update the pitch
    const result = await updatePitchAction(pitchId, body, userId)
    
    if (!result.isSuccess) {
      console.error(`PATCH /api/pitches/${pitchId}: Update failed:`, result.message);
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
    
    console.log(`PATCH /api/pitches/${pitchId}: Update successful`);
    
    return NextResponse.json({ 
      message: "Pitch updated successfully", 
      data: result.data 
    })
  } catch (error: any) {
    console.error("Error in PATCH /api/pitches/[pitchId]:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 