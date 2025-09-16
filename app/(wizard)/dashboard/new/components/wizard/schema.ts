import * as z from "zod"
import type { Section } from "@/types"

// ---------------------------------------------------------------------------
// Word count utilities
// ---------------------------------------------------------------------------

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function wordRange(min: number, max: number, label: string) {
  return z
    .string()
    .describe(JSON.stringify({ minWords: min, maxWords: max }))
    .refine(
      val => {
        const words = countWords(val)
        return words >= min && words <= max
      },
      {
        message: `${label} must be between ${min} and ${max} words`
      }
    )
}

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": wordRange(
    10,
    100,
    "Action step description"
  ),
  "what-was-the-outcome-of-this-step-optional": wordRange(
    10,
    100,
    "Outcome of this step"
  ).optional()
})

export const starExampleSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": wordRange(
      10,
      100,
      "Experience context"
    ),
    "briefly-describe-the-situation-or-challenge-you-faced": wordRange(
      10,
      100,
      "Situation or challenge"
    )
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": wordRange(
      10,
      100,
      "Your responsibility"
    ),
    "what-constraints-or-requirements-did-you-need-to-consider": wordRange(
      10,
      100,
      "Constraints or requirements"
    ).optional()
  }),
  action: z.object({
    steps: z
      .array(actionStepSchema)
      .min(1, "Please add at least one action step")
  }),
  result: z.object({
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
      wordRange(10, 100, "Outcome benefits")
  })
})

export const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z
    .string()
    .min(1, "Role name must be at least 1 character")
    .max(150, "Role name must be 150 characters or fewer"),
  organisationName: z
    .string()
    .min(10, "Organisation name must be at least 10 characters")
    .max(150, "Organisation name must be 150 characters or fewer"),
  roleLevel: z
    .enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"])
    .optional()
    .refine(val => val !== undefined, {
      message: "Please select a role level"
    }),
  pitchWordLimit: z
    .number()
    .min(400, "Pitch must be at least 400 words")
    .max(1000, "Pitch must be no more than 1000 words"),
  roleDescription: z
    .string()
    .min(1000, "Role description must be at least 1000 characters")
    .max(10000, "Role description must be no more than 10,000 characters"),
  relevantExperience: z
    .string()
    .min(1000, "Relevant experience must be at least 1000 characters")
    .max(10000, "Relevant experience must be no more than 10,000 characters"),
  albertGuidance: z
    .string()
    .min(1, "Please indicate whether you'd like Albert's guidance"),
  starExamplesCount: z.enum(["2", "3", "4"]).default("2"),
  starExampleDescriptions: z
    .array(
      z
        .string()
        .min(10, "Each description must be at least 10 characters")
        .max(100, "Each description must be 100 characters or fewer")
    )
    .optional(),
  starExamples: z
    .array(starExampleSchema)
    .min(1, "Please complete at least one STAR example"),
  pitchContent: z.string().optional(),
  agentExecutionId: z.string().optional()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

// ---------------------------------------------------------------------------
// Constants and helpers
// ---------------------------------------------------------------------------

export const SECTION_ORDER: Section[] = [
  "INTRO",
  "ROLE",
  "EXP",
  "GUIDE",
  "STAR",
  "FINAL"
]

export function createEmptyStarExample() {
  return {
    situation: {
      "where-and-when-did-this-experience-occur": "",
      "briefly-describe-the-situation-or-challenge-you-faced": ""
    },
    task: {
      "what-was-your-responsibility-in-addressing-this-issue": ""
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
