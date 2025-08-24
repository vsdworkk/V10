import { z } from "zod"

// Word count utilities
function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function wordRange(min: number, max: number) {
  return z
    .string()
    .describe(JSON.stringify({ minWords: min, maxWords: max }))
    .refine(val => {
      const words = countWords(val)
      return words >= min && words <= max
    }, `Must be between ${min} and ${max} words`)
}

// Action Step
export const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": wordRange(20, 150),
  "what-was-the-outcome-of-this-step-optional": wordRange(10, 150)
})

// STAR Example
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

// Update schema (PATCH-style)
export const updatePitchSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string(),
    roleName: z.string().min(10).max(150),
    roleLevel: z.string().nonempty(),
    pitchWordLimit: z.number().min(400).max(1000),
    roleDescription: z.string().nullable(),
    relevantExperience: z.string().min(1000).max(10000),
    organisationName: z.string().nullable(),
    resumePath: z.string().nullable(),

    starExamples: z.array(starSchema),
    albertGuidance: z.string().min(1).nullable(),
    pitchContent: z.string().nullable(),

    agentExecutionId: z.string().nullable(),
    starExamplesCount: z.number().min(2).max(4),
    starExampleDescriptions: z.array(z.string().min(10).max(100)),

    currentStep: z.number(),
    status: z.enum(["draft", "final", "submitted"])
  })
  .partial()
  .strict()

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
