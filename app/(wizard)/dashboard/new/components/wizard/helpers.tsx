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
  if (step === 1) return { section: "INTRO", header: "" }
  if (step === 2) return { section: "ROLE", header: "Role Details" }
  if (step === 3) return { section: "EXP", header: "Your Experience" }
  if (step === 4) return { section: "GUIDE", header: "Identify Key Experiences for Your Pitch" }

  // Step 5 is the STAR Examples Introduction (part of STAR section)
  if (step === 5) return { section: "STAR", header: "" }

  const firstActualStarStep = 6
  const lastStarStep = 5 + starCount * 4
  if (step >= firstActualStarStep && step <= lastStarStep) {
    const indexWithinStar = step - firstActualStarStep
    const exampleIndex = Math.floor(indexWithinStar / 4) + 1 // 1-based
    const subStepIndex = indexWithinStar % 4
    const subStepLabel = ["Situation", "Task", "Action", "Result"][subStepIndex]
    // Convert numeric index to ordinal text
    const ordinalLabels = ["First", "Second", "Third", "Fourth"]
    const ordinalLabel = ordinalLabels[exampleIndex - 1] || `Example ${exampleIndex}`
    return {
      section: "STAR",
      header: `${ordinalLabel} Example`
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
      return 5 // Start with the intro step
    case "FINAL":
    default:
      return 5 + starCount * 4 + 1 // Adjusted for new intro step
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
      roleLevel: undefined,
      pitchWordLimit: 650,
      roleDescription: "",
      relevantExperience: "",
      albertGuidance: "",
      starExamples: [createEmptyStarExample()],
      starExamplesCount: "2",
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
  const determinedLevel = validLevels.includes(pitchData.roleLevel as any)
    ? (pitchData.roleLevel as PitchWizardFormData["roleLevel"])
    : undefined

  const sc = pitchData.starExamplesCount
    ? String(pitchData.starExamplesCount)
    : "2"

  // Define valid star counts and derive the enum type
  const validStarCounts = ["2", "3", "4"] as const
  type StarCountEnum = (typeof validStarCounts)[number]

  const safeStarCount = validStarCounts.includes(sc as any) ? sc : "2"

  return {
    userId: pitchData.userId,
    roleName: pitchData.roleName ?? "",
    organisationName: pitchData.organisationName ?? "",
    // cast due to optional default value when creating new pitch
    roleLevel: determinedLevel as any,
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
