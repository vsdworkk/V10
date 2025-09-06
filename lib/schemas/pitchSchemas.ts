/**
 * @file lib/schemas/pitchSchemas.ts
 * @description
 * Zod schemas and helpers for APSPitchPro pitch data validation.
 * - Provides word-count constrained fields for STAR inputs.
 * - Defines the PATCH-style `updatePitchSchema` used by /api/pitches/[pitchId].
 * - Adds feedback fields: `pitchRating` and `ratingReason` to support
 *   post-generation user feedback capture.
 *
 * Key exports:
 * - `updatePitchSchema`   : PATCH validation for updating a pitch.
 * - `PitchRequestSchema`  : Minimal schema for generation workflows.
 * - `starSchema`          : STAR example structure validation.
 *
 * Notes:
 * - `updatePitchSchema` is `.partial().strict()`, so all fields are optional at the API layer.
 * - New fields:
 *      pitchRating  : integer 1..5, optional, nullable
 *      ratingReason : string up to 2000 chars, optional, nullable
 */

import { z } from "zod"

/* -----------------------------------------------------------------------------
 * Word count utilities and helpers
 * ---------------------------------------------------------------------------*/

/**
 * Count words in a string by splitting on whitespace.
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Constrain a string to a word range [min, max] using a Zod refinement.
 */
function wordRange(min: number, max: number) {
  return z
    .string()
    .min(1)
    .refine(
      val => {
        const n = countWords(val)
        return n >= min && n <= max
      },
      { message: `Must be between ${min} and ${max} words` }
    )
}

/* -----------------------------------------------------------------------------
 * STAR schemas
 * ---------------------------------------------------------------------------*/

/**
 * Action step within the STAR Action section.
 */
export const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": wordRange(20, 150),
  "what-was-the-outcome-of-this-step-optional": wordRange(10, 150)
})

/**
 * Full STAR example schema.
 */
export const starSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": wordRange(15, 150),
    "briefly-describe-the-situation-or-challenge-you-faced": wordRange(20, 150)
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": wordRange(20, 150),
    "what-constraints-or-requirements-did-you-need-to-consider": wordRange(
      20,
      150
    ).optional()
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1)
  }),
  result: z.object({
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
      wordRange(20, 150)
  })
})

/* -----------------------------------------------------------------------------
 * Update schema (PATCH-style) used by /api/pitches/[pitchId]
 * - All properties are optional due to `.partial()`.
 * - `.strict()` blocks unexpected properties.
 * - Includes new feedback fields: pitchRating, ratingReason.
 * ---------------------------------------------------------------------------*/

export const updatePitchSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string(),

    // Role details
    roleName: z.string().min(1).max(150),
    roleLevel: z.string().nonempty(),

    // Meta
    pitchWordLimit: z.number().min(400).max(1000),
    roleDescription: z.string().nullable(),
    relevantExperience: z.string().min(1000).max(10000),
    organisationName: z.string().nullable(),
    resumePath: z.string().nullable(),

    // STAR data
    starExamples: z.array(starSchema),
    starExamplesCount: z.number().min(2).max(4),
    starExampleDescriptions: z.array(z.string().min(10).max(100)),

    // Generated content
    albertGuidance: z.string().min(1).nullable(),
    pitchContent: z.string().nullable(),

    // Agent / async job linkage
    agentExecutionId: z.string().nullable(),

    // Wizard bookkeeping
    currentStep: z.number(),
    status: z.enum(["draft", "final", "submitted"]),

    // --- New feedback fields ---
    /**
     * User rating of the generated pitch. Integer 1..5. Optional for PATCH.
     * Nullable to allow clearing the rating if needed.
     */
    pitchRating: z.number().int().min(1).max(5).optional().nullable(),

    /**
     * Structured reason payload or plain text. Capped to 2000 chars.
     * For low ratings (<= 2), client may send a JSON string like:
     *   {"reasons": ["unclear_questionnaire", "robotic_content"], "otherText": "..."}
     */
    ratingReason: z.string().max(2000).optional().nullable()
  })
  .partial()
  .strict()

/* -----------------------------------------------------------------------------
 * Minimal request payload used for generation/guidance services
 * ---------------------------------------------------------------------------*/

/**
 * Minimal schema used when starting generation workflows.
 * This is not used by the PATCH route.
 */
export const PitchRequestSchema = z.object({
  userId: z.string(),
  pitchId: z.string(),
  roleName: z.string(),
  organisationName: z.string().optional(),
  roleLevel: z.string(),
  pitchWordLimit: z.number(),
  roleDescription: z.string().optional(),
  relevantExperience: z.string().optional(),
  albertGuidance: z.string().optional(),
  starExamples: z.array(z.any()),
  starExamplesCount: z.number().optional()
})
