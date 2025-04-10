"use server"
/**
 * @description
 * An API route for updating an existing pitch by ID. Expects a PATCH request.
 * The request body should contain updated pitch data. We enforce user ownership.
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
 * The route is accessible at /api/pitchWizard/[pitchId] for PATCH requests.
 * Example usage:
 *   fetch("/api/pitchWizard/<pitchId>", {
 *     method: "PATCH",
 *     body: JSON.stringify({...}),
 *   })
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updatePitchAction } from "@/actions/db/pitches-actions"
import { z } from "zod"

/**
 * We'll define a subset of pitch fields we allow for updates.
 * For flexibility, we can allow all the same fields we used for creation.
 */
const updatePitchSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().optional(),
  roleName: z.string().min(2),
  roleLevel: z.string().nonempty(),
  pitchWordLimit: z.number().min(400).max(2000),
  roleDescription: z.string().optional().nullable(),
  yearsExperience: z.string().nonempty(),
  relevantExperience: z.string().min(10),
  resumePath: z.string().optional().nullable(),
  // We store star examples as JSON
  starExample1: z.any().optional(),
  starExample2: z.any().optional(),
  albertGuidance: z.string().optional().nullable(),
  pitchContent: z.string().optional().nullable(),
  starExamplesCount: z.number().min(2).max(3).optional()
})

/**
 * A dynamic route handler for /api/pitchWizard/[pitchId].
 * We only define a PATCH method here to handle pitch updates.
 * NOTE: We mark "params" as Promise<{ pitchId: string }> and then await it.
 */
export async function PATCH(
  request: NextRequest,
  // Workaround #1: Next.js expects params to be a Promise in Next 15+.
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Extract the pitchId from params
    const { pitchId } = await params
    
    console.log(`PATCH /api/pitchWizard/${pitchId}: Processing update request`);
    
    // Parse the request body
    const body = await request.json()
    
    // Ensure user ID is set correctly (enforce ownership)
    body.userId = userId
    
    // Validate the request body
    try {
      updatePitchSchema.parse(body)
    } catch (err) {
      console.error(`PATCH /api/pitchWizard/${pitchId}: Validation error:`, err);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    
    console.log(`PATCH /api/pitchWizard/${pitchId}: Calling updatePitchAction`);
    
    // Call our server action to update the pitch
    const result = await updatePitchAction(pitchId, body, userId)
    
    if (!result.isSuccess) {
      console.error(`PATCH /api/pitchWizard/${pitchId}: Update failed:`, result.message);
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
    
    console.log(`PATCH /api/pitchWizard/${pitchId}: Update successful`);
    
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