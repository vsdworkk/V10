"use server"

/**
 * @description
 * PATCH /api/pitches/[pitchId]
 * Update an existing pitch. Checks ownership via Clerk.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updatePitchAction } from "@/actions/db/pitches-actions"
import { updatePitchSchema } from "@/lib/schemas/pitchSchemas"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    /* ------------------------------------------------------------------ */
    /* 0.  Auth                                                           */
    /* ------------------------------------------------------------------ */
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pitchId } = await params
    const body = await request.json()

    /* ------------------------------------------------------------------ */
    /* 1.  Attach owner & validate                                         */
    /* ------------------------------------------------------------------ */
    body.userId = userId // enforce correct owner

    try {
      updatePitchSchema.parse(body) // zod validation (includes agentExecutionId)
    } catch (err) {
      console.error("Pitch validation error:", err)
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    /* ------------------------------------------------------------------ */
    /* 2.  Update                                                          */
    /* ------------------------------------------------------------------ */
    const result = await updatePitchAction(pitchId, body, userId)
    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Pitch updated successfully",
        data: result.data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in PATCH /api/pitches/[pitchId]:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
