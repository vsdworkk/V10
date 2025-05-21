/**
 * @description
 * POST /api/pitches
 * Create or update a pitch record when `id` is present in the body.
 */

import { NextResponse } from "next/server"
import {
  createPitchAction,
  updatePitchAction
} from "@/actions/db/pitches-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    /* ------------------------------------------------------------------ */
    /* 1.  Basic guard‑rails                                              */
    /* ------------------------------------------------------------------ */
    if (!body.userId || !body.roleName || !body.roleLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    /* ------------------------------------------------------------------ */
    /* 2.  Build the payload expected by Drizzle actions                  */
    /* ------------------------------------------------------------------ */
    const pitchData = {
      // ownership / foreign‑key
      userId: body.userId,

      // role information
      roleName: body.roleName,
      organisationName: body.organisationName || null,
      roleLevel: body.roleLevel,

      // misc meta
      pitchWordLimit: body.pitchWordLimit || 650,
      roleDescription: body.roleDescription || "",
      relevantExperience: body.relevantExperience || "",

      // resume upload (optional)
      resumePath: body.resumePath || null,

      // NEW — store PromptLayer execution‑id so we can link the callback
      agentExecutionId: body.agentExecutionId || null,

      // STAR data
      starExamples: body.starExamples || [],
      starExamplesCount: body.starExamplesCount
        ? parseInt(body.starExamplesCount, 10)
        : 1,
      starExampleDescriptions: body.starExampleDescriptions || [],

      // generated content
      albertGuidance: body.albertGuidance || "",
      pitchContent: body.pitchContent || "",

      // wizard bookkeeping
      status: body.status || "draft",
      currentStep: body.currentStep || 1
    }

    /* ------------------------------------------------------------------ */
    /* 3.  Persist                                                        */
    /* ------------------------------------------------------------------ */
    const result = body.id
      ? await updatePitchAction(body.id, pitchData, body.userId)
      : await createPitchAction(pitchData)

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: body.id ? "Pitch updated" : "Pitch created",
        data: result.data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in POST /api/pitches:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
