// Zod schemas and helpers for the pitch wizard form
import * as z from "zod"
import type { Section } from "@/types"

// Zod schema for the wizard
const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": z.string(),
  "what-was-the-outcome-of-this-step-optional": z.string().optional()
})

const starExampleSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z
      .string()
      .min(5, "Please describe where/when."),
    "briefly-describe-the-situation-or-challenge-you-faced": z.string().min(5)
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z.string().min(5),
    "what-constraints-or-requirements-did-you-need-to-consider": z
      .string()
      .optional()
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1, "At least one action step")
  }),
  result: z.object({
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z
      .string()
      .min(5)
  })
})

export const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z
    .string()
    .min(1, "Role name is required")
    .max(30, "Role name must be 30 characters or less"),
  organisationName: z
    .string()
    .min(1, "Organization name is required")
    .max(30, "Organization name must be 30 characters or less"),
  roleLevel: z.enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]),
  pitchWordLimit: z.number().min(400, "Minimum 400 words"),
  roleDescription: z
    .string()
    .min(1000, "Role description must be at least 1,000 characters")
    .max(10000, "Role description must be 10,000 characters or less"),
  relevantExperience: z.string().min(10),
  albertGuidance: z.string().optional(),

  starExamplesCount: z
    .enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"])
    .default("1"),
  starExampleDescriptions: z.array(z.string()).optional(),
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
