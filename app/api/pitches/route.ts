/**
 * @description
 * POST /api/pitches
 * Create or update a pitch record when `id` is present in the body.
 */

import {
  createPitchAction,
  updatePitchAction
} from "@/actions/db/pitches-actions"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    /* ------------------------------------------------------------------ */
    /* 1. Validate input against schema                                   */
    /* ------------------------------------------------------------------ */
    // const result = updatePitchSchema.safeParse(body)

    // if (!result.success) {
    //   return NextResponse.json(
    //     {
    //       error: "Invalid input",
    //       issues: result.error.format()
    //     },
    //     { status: 400 }
    //   )
    // }

    // const data = result.data

    const { userId } = await auth()
    const data = body

    if (!data.userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    if (userId !== data.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* ------------------------------------------------------------------ */
    /* 2. Build the payload expected by Drizzle actions                  */
    /* ------------------------------------------------------------------ */
    const pitchData = {
      userId: data.userId,

      // Role info
      roleName: data.roleName ?? "",
      organisationName: data.organisationName ?? null,
      roleLevel: data.roleLevel ?? "",

      // Meta
      pitchWordLimit: data.pitchWordLimit ?? 650,
      roleDescription: data.roleDescription ?? "",
      relevantExperience: data.relevantExperience ?? "",
      resumePath: data.resumePath ?? null,
      agentExecutionId: data.agentExecutionId ?? null,

      // STAR data
      starExamples: data.starExamples ?? [],
      starExamplesCount: data.starExamplesCount ?? 2,
      starExampleDescriptions: data.starExampleDescriptions ?? [],

      // Generated content
      albertGuidance: data.albertGuidance ?? "",
      pitchContent: data.pitchContent ?? "",

      // Wizard bookkeeping
      status: data.status ?? "draft",
      currentStep: data.currentStep ?? 1
    }

    /* ------------------------------------------------------------------ */
    /* 3. Persist to database                                             */
    /* ------------------------------------------------------------------ */
    const dbResult = data.id
      ? await updatePitchAction(data.id, pitchData, data.userId)
      : await createPitchAction(pitchData)

    if (!dbResult.isSuccess) {
      return NextResponse.json({ error: dbResult.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: data.id ? "Pitch updated" : "Pitch created",
        data: dbResult.data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in POST /api/pitches:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
