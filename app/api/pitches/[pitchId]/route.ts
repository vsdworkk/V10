"use server"
/**
 * @description
 * An API route for updating an existing pitch by ID. Expects a PATCH request.
 * The request body should contain updated pitch data. We enforce user ownership.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { updatePitchAction } from "@/actions/db/pitches-actions"
import { z } from "zod"

/**
 * Zod schema for a single Action step
 */
const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": z.string(),
  "how-did-you-do-it-tools-methods-or-skills": z.string(),
  "what-was-the-outcome-of-this-step-optional": z.string().optional()
})

/**
 * Zod schema for one STAR example
 */
const starSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z.string().optional(),
    "briefly-describe-the-situation-or-challenge-you-faced": z.string().optional(),
    "why-was-this-a-problem-or-why-did-it-matter": z.string().optional()
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z.string().optional(),
    "how-would-completing-this-task-help-solve-the-problem": z.string().optional(),
    "what-constraints-or-requirements-did-you-need-to-consider": z.string().optional()
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1).optional()
  }),
  result: z.object({
    "what-positive-outcome-did-you-achieve": z.string().optional(),
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z.string().optional(),
    "what-did-you-learn-from-this-experience": z.string().optional()
  })
})

/**
 * Update schema for a pitch record. 
 * starExamples is now an array of starSchema objects (optional).
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
  
  // We store starExamples as an array of starSchema objects
  starExamples: z.array(starSchema).optional(),

  albertGuidance: z.string().optional().nullable(),
  pitchContent: z.string().optional().nullable(),

  /**
   * starExamplesCount can be from 1..10 (or any range).
   * Adjust min/max as you see fit.
   */
  starExamplesCount: z.number().min(1).max(10).optional(),

  // You could also allow currentStep, status, etc. if needed
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pitchId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pitchId } = await params
    console.log(`PATCH /api/pitchWizard/${pitchId}: Processing update request`)

    const body = await request.json()
    // Enforce user ownership
    body.userId = userId

    // Validate
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