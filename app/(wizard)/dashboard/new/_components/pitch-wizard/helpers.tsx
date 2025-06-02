// Helper functions for managing pitch wizard state and defaults
import type { Section } from "@/types"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import { PitchWizardFormData, createEmptyStarExample } from "./schema"

/**
 * Computes the section and header for a given step
 */
export function computeSectionAndHeader(
  step: number,
  starCount: number
): { section: Section; header: string } {
  if (step === 1)
    return { section: "INTRO", header: "Welcome to the Pitch Wizard" }
  if (step === 2) return { section: "ROLE", header: "Role Details" }
  if (step === 3) return { section: "EXP", header: "Your Experience" }
  if (step === 4) return { section: "GUIDE", header: "AI Guidance" }

  const firstStarStep = 5
  const lastStarStep = 4 + starCount * 4
  if (step >= firstStarStep && step <= lastStarStep) {
    const indexWithinStar = step - firstStarStep
    const exampleIndex = Math.floor(indexWithinStar / 4) + 1 // 1-based
    const subStepIndex = indexWithinStar % 4
    const subStepLabel = ["Situation", "Task", "Action", "Result"][subStepIndex]
    return {
      section: "STAR",
      header: `STAR Example #${exampleIndex} – ${subStepLabel}`
    }
  }

  // final
  return { section: "FINAL", header: "Review & Edit" }
}

/**
 * Gets the first step number for a given section
 */
export function firstStepOfSection(section: Section, starCount: number) {
  switch (section) {
    case "INTRO":
      return 1
    case "ROLE":
      return 2
    case "EXP":
      return 3
    case "GUIDE":
      return 4
    case "STAR":
      return 5
    case "FINAL":
    default:
      return 4 + starCount * 4 + 1
  }
}

/**
 * Maps DB record to form defaults
 */
export function mapExistingDataToDefaults(
  userId: string,
  pitchData?: SelectPitch
): Partial<PitchWizardFormData> {
  // return default form data if no pitch data exists
  if (!pitchData) {
    return {
      userId,
      roleName: "",
      organisationName: "",
      roleLevel: "APS4",
      pitchWordLimit: 650,
      roleDescription: "",
      relevantExperience: "",
      albertGuidance: "",
      starExamples: [createEmptyStarExample()],
      starExamplesCount: "1",
      starExampleDescriptions: [],
      pitchContent: "",
      agentExecutionId: ""
    }
  }

  const validLevels = [
    "APS1",
    "APS2",
    "APS3",
    "APS4",
    "APS5",
    "APS6",
    "EL1"
  ] as const
  type RoleLevelEnum = (typeof validLevels)[number] // Derive the enum type

  const determinedLevel = validLevels.includes(pitchData.roleLevel as any) // Check if DB value is valid
    ? pitchData.roleLevel
    : "APS4" // Use default if not

  const sc = pitchData.starExamplesCount
    ? String(pitchData.starExamplesCount)
    : "1"

  // Define valid star counts and derive the enum type
  const validStarCounts = ["1", "2", "3", "4"] as const
  type StarCountEnum = (typeof validStarCounts)[number]

  const safeStarCount = validStarCounts.includes(sc as any) ? sc : "1"

  return {
    userId: pitchData.userId,
    roleName: pitchData.roleName ?? "",
    organisationName: pitchData.organisationName ?? "",
    roleLevel: determinedLevel as RoleLevelEnum, // Assert the type here
    pitchWordLimit: pitchData.pitchWordLimit || 650,
    roleDescription: pitchData.roleDescription ?? "",
    relevantExperience: pitchData.relevantExperience ?? "",
    albertGuidance: pitchData.albertGuidance ?? "",
    starExamples:
      pitchData.starExamples && pitchData.starExamples.length > 0
        ? pitchData.starExamples.map(ex => ({
            // Map and provide defaults
            situation: {
              "where-and-when-did-this-experience-occur":
                ex.situation?.["where-and-when-did-this-experience-occur"] ??
                "",
              "briefly-describe-the-situation-or-challenge-you-faced":
                ex.situation?.[
                  "briefly-describe-the-situation-or-challenge-you-faced"
                ] ?? ""
            },
            task: {
              "what-was-your-responsibility-in-addressing-this-issue":
                ex.task?.[
                  "what-was-your-responsibility-in-addressing-this-issue"
                ] ?? "",
              "what-constraints-or-requirements-did-you-need-to-consider":
                ex.task?.[
                  "what-constraints-or-requirements-did-you-need-to-consider"
                ] ?? ""
            },
            action: {
              steps: ex.action?.steps?.map(step => ({
                stepNumber: step.stepNumber ?? 1,
                "what-did-you-specifically-do-in-this-step":
                  step["what-did-you-specifically-do-in-this-step"] ?? "",
                "what-was-the-outcome-of-this-step-optional":
                  step["what-was-the-outcome-of-this-step-optional"] ?? ""
              })) ?? [
                {
                  stepNumber: 1,
                  "what-did-you-specifically-do-in-this-step": "",
                  "what-was-the-outcome-of-this-step-optional": ""
                }
              ]
            },
            result: {
              "how-did-this-outcome-benefit-your-team-stakeholders-or-organization":
                ex.result?.[
                  "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
                ] ?? ""
            }
          }))
        : [createEmptyStarExample()],
    starExamplesCount: safeStarCount as StarCountEnum, // Assert the type here
    starExampleDescriptions: pitchData.starExampleDescriptions || [],
    pitchContent: pitchData.pitchContent ?? "",
    agentExecutionId: pitchData.agentExecutionId ?? ""
  }
}

/**
 * Creates payload from form data
 */
export function createPitchPayload(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  currentStep: number,
  status: "draft" | "final" = "draft"
) {
  return {
    ...(pitchId ? { id: pitchId } : {}),
    userId: data.userId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription ?? "",
    relevantExperience: data.relevantExperience ?? "",
    albertGuidance: data.albertGuidance ?? "",
    pitchContent: data.pitchContent ?? "",
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10),
    starExampleDescriptions: data.starExampleDescriptions || [],
    status,
    // `currentStep` maps to the `current_step` column in the DB
    // Drizzle uses camelCase properties for snake_case columns
    currentStep,
    agentExecutionId: data.agentExecutionId || null
  }
}
