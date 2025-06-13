// Zod schemas and helpers for the pitch wizard form
import * as z from "zod"
import type { Section } from "@/types"

// ---------------------------------------------------------------------------
// Word count utilities
// ---------------------------------------------------------------------------

/**
 * Count words in a string.
 */
function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Validate that a string has a word count within a specified range.
 */
function wordRange(min: number, max: number) {
  return z
    .string()
    .describe(JSON.stringify({ minWords: min, maxWords: max }))
    .refine(
      val => {
        const words = countWords(val)
        return words >= min && words <= max
      },
      {
        message: `Must be between ${min} and ${max} words`
      }
    )
}

// Zod schema for the wizard
export const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": wordRange(20, 150),
  "what-was-the-outcome-of-this-step-optional": wordRange(10, 150)
})

export const starExampleSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": wordRange(15, 150),
    "briefly-describe-the-situation-or-challenge-you-faced": wordRange(20, 150)
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": wordRange(20, 150),
    "what-constraints-or-requirements-did-you-need-to-consider": wordRange(
      20,
      150
    )
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1, "At least one action step")
  }),
  result: z.object({
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
      wordRange(20, 150)
  })
})

export const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z.string().min(10).max(150),
  organisationName: z.string().min(10).max(150),
  roleLevel: z.enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]),
  pitchWordLimit: z.number().min(400).max(1000),
  roleDescription: z
    .string()
    .min(1000, "Role description must be at least 1,000 characters")
    .max(10000, "Role description must be 10,000 characters or less"),
  relevantExperience: z.string().min(1000).max(10000),
  albertGuidance: z.string().min(1),

  starExamplesCount: z.enum(["2", "3", "4"]).default("2"),
  starExampleDescriptions: z.array(z.string().min(10).max(100)).optional(),
  starExamples: z.array(starExampleSchema).min(1, "At least one STAR example"),

  pitchContent: z.string().optional(),
  agentExecutionId: z.string().optional()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

// Constants
export const SECTION_ORDER: Section[] = [
  "INTRO",
  "ROLE",
  "EXP",
  "GUIDE",
  "STAR",
  "FINAL"
]

// Helper to create an empty STAR example
export function createEmptyStarExample() {
  return {
    situation: {
      "where-and-when-did-this-experience-occur": "",
      "briefly-describe-the-situation-or-challenge-you-faced": ""
    },
    task: {
      "what-was-your-responsibility-in-addressing-this-issue": "",
      "what-constraints-or-requirements-did-you-need-to-consider": ""
    },
    action: {
      steps: [
        {
          stepNumber: 1,
          "what-did-you-specifically-do-in-this-step": "",
          "what-was-the-outcome-of-this-step-optional": ""
        }
      ]
    },
    result: {
      "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": ""
    }
  }
}
