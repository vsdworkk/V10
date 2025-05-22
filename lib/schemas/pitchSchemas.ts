import { z } from "zod"

/**
 * Zod schema for a single Action step
 */
export const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": z.string(),
  "how-did-you-do-it-tools-methods-or-skills": z.string(),
  "what-was-the-outcome-of-this-step-optional": z.string().optional()
})

/**
 * Zod schema for a single STAR Example
 * Removed the old fields that we no longer collect (why-was-this-a-problem, how-would-completing, what-did-you-learn).
 */
export const starSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z.string().optional(),
    "briefly-describe-the-situation-or-challenge-you-faced": z.string().optional()
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z.string().optional(),
    "what-constraints-or-requirements-did-you-need-to-consider": z.string().optional()
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1).optional()
  }),
  result: z.object({
    "what-positive-outcome-did-you-achieve": z.string().optional(),
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z.string().optional()
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
    roleName: z.string().min(2).optional(),
    roleLevel: z.string().nonempty().optional(),
    pitchWordLimit: z.number().min(400).max(2000).optional(),
    roleDescription: z.string().optional().nullable(),
    relevantExperience: z.string().min(10).optional(),

    // The array of star examples, each must match starSchema
    starExamples: z.array(starSchema).optional(),

    albertGuidance: z.string().optional().nullable(),
    pitchContent: z.string().optional().nullable(),

    // Add agentExecutionId for PromptLayer integration
    agentExecutionId: z.string().optional().nullable(),

    // starExamplesCount can be 1..10
    starExamplesCount: z.number().min(1).max(10).optional(),

    // starExampleDescriptions for short descriptions of each STAR example
    starExampleDescriptions: z.array(z.string()).optional(),

    // Add fields like currentStep or status if needed
    currentStep: z.number().optional(),
    status: z.enum(["draft", "final", "submitted"]).optional()
  })
  .partial()