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
  pitchWordLimit: z.number().min(100).max(2000),
  roleDescription: z.string().optional().nullable(),
  yearsExperience: z.string().nonempty(),
  relevantExperience: z.string().min(10),
  resumePath: z.string().optional().nullable(),
  // We store star examples as JSON
  starExample1: z.any().optional(),
  starExample2: z.any().optional(),
  pitchContent: z.string().optional().nullable()
})

/**
 * A dynamic route handler for /api/pitchWizard/[pitchId].
 * We only define a PATCH method here to handle pitch updates.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { pitchID: string } }
) {
  try {
    // Ensure the user is logged in
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - please log in first" },
        { status: 401 }
      )
    }

    const pitchId = params.pitchID
    if (!pitchId) {
      return NextResponse.json(
        { error: "Pitch ID is required in the URL" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate the incoming data with zod
    const parseResult = updatePitchSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    // At this point we have validated data
    const updatedData = parseResult.data

    // We call updatePitchAction, ensuring that we pass userId for ownership check.
    const result = await updatePitchAction(pitchId, updatedData, userId)
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Pitch updated successfully", data: result.data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in PATCH /api/pitchWizard/[pitchId]:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
