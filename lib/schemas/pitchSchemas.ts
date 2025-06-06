import { z } from "zod"

// ---------------------------------------------------------------------------
// Word count utilities (server side)
// ---------------------------------------------------------------------------

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function wordRange(min: number, max: number) {
  return z.string().refine(val => {
    const words = countWords(val)
    return words >= min && words <= max
  }, `Must be between ${min} and ${max} words`)
}

/**
 * Zod schema for a single Action step
 */
export const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": wordRange(20, 150),
  "what-was-the-outcome-of-this-step-optional": wordRange(10, 150)
})

/**
 * Zod schema for a single STAR Example
 * Removed the old fields that we no longer collect (why-was-this-a-problem, how-would-completing, what-did-you-learn).
 */
export const starSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": wordRange(10, 150),
    "briefly-describe-the-situation-or-challenge-you-faced": wordRange(10, 150)
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": wordRange(20, 150),
    "what-constraints-or-requirements-did-you-need-to-consider": wordRange(
      20,
      150
    )
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1).optional()
  }),
  result: z.object({
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
      wordRange(20, 150)
  })
})

/**
 * Zod schema for the pitch record update.
 * Removed yearsExperience and resumePath.
 */
export const updatePitchSchema = z
  .object({
    id: z.string().uuid().optional(),
    userId: z.string().optional(),
    roleName: z.string().min(10).max(150).optional(),
    roleLevel: z.string().nonempty().optional(),
    pitchWordLimit: z.number().min(400).max(1000).optional(),
    roleDescription: z.string().optional().nullable(),
    relevantExperience: z.string().min(1000).max(10000).optional(),

    // The array of star examples, each must match starSchema
    starExamples: z.array(starSchema).optional(),

    albertGuidance: z.string().min(1).optional().nullable(),
    pitchContent: z.string().optional().nullable(),

    // Add agentExecutionId for PromptLayer integration
    agentExecutionId: z.string().optional().nullable(),

    // starExamplesCount can be 2..4
    starExamplesCount: z.number().min(2).max(4).optional(),

    // starExampleDescriptions for short descriptions of each STAR example
    starExampleDescriptions: z.array(z.string().min(10).max(100)).optional(),

    // Add fields like currentStep or status if needed
    currentStep: z.number().optional(),
    status: z.enum(["draft", "final", "submitted"]).optional()
  })
  .partial()
