/**
 * @description
 * An API route that handles the creation of a new pitch record in "draft" status.
 * The client wizard sends a POST request with the entire pitch data as JSON.
 *
 * Key Features:
 * - Reads request JSON for pitch fields
 * - Calls createPitchAction from pitches-actions
 * - Returns 200 on success, 400 or 500 on error
 *
 * @dependencies
 * - createPitchAction from "@/actions/db/pitches-actions"
 * - Next.js "NextResponse" for JSON responses
 *
 * @notes
 * - We do not do AI generation here, purely storing data as draft
 */

import { NextResponse } from "next/server"
import { createPitchAction } from "@/actions/db/pitches-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate minimal fields. (In an advanced scenario, we might replicate
    // the Zod schema logic or rely on the wizard's own validation.)
    if (!body.userId || !body.roleName || !body.roleLevel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prepare data to create pitch
    const pitchData = {
      userId: body.userId,
      roleName: body.roleName,
      roleLevel: body.roleLevel,
      pitchWordLimit: body.pitchWordLimit || 500,
      roleDescription: body.roleDescription || "",
      yearsExperience: body.yearsExperience || "",
      relevantExperience: body.relevantExperience || "",
      resumePath: body.resumePath || null,
      starExample1: body.starExample1 || null,
      starExample2: body.starExample2 || null,
      pitchContent: body.pitchContent || "",
      status: body.status || "draft"
    }

    // Insert pitch
    const result = await createPitchAction(pitchData)

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Pitch created", data: result.data }, { status: 200 })
  } catch (error: any) {
    console.error("Error in /api/pitchWizard POST:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}