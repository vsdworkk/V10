"use server"

/**
 * @description
 * PATCH /api/pitches/[pitchId]
 * Update an existing pitch. Checks ownership via Clerk.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updatePitchAction } from "@/actions/db/pitches-actions"
import { updatePitchSchema } from "@/lib/schemas/pitchSchemas"
import { z } from "zod"

// UUID v4 validation
const uuidSchema = z.string().uuid()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { pitchId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pitchId } = params

    const parsedPitchId = uuidSchema.safeParse(pitchId)
    if (!parsedPitchId.success) {
      return NextResponse.json(
        { error: "Invalid pitch ID (must be a valid UUID)" },
        { status: 400 }
      )
    }

    const body = await request.json()
    body.userId = userId // enforce correct owner

    const parsedBody = updatePitchSchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten()
        },
        { status: 400 }
      )
    }

    const result = await updatePitchAction(pitchId, parsedBody.data, userId)
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
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}
