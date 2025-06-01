// Validation helpers for the pitch wizard steps
import { UseFormReturn } from "react-hook-form"
import { PitchWizardFormData } from "./schema"

/**
 * Validates fields for a specific step in the wizard
 */
export async function validateStep(
  step: number,
  starCount: number,
  methods: UseFormReturn<PitchWizardFormData>
): Promise<boolean> {
  let result = false

  if (step === 1) {
    // Intro step has no validation
    result = true
  } else if (step === 2) {
    // Role Details step
    result = await methods.trigger([
      "roleName",
      "organisationName",
      "roleLevel",
      "pitchWordLimit",
      "roleDescription"
    ])
  } else if (step === 3) {
    // Experience step - only validate relevantExperience
    result = await methods.trigger(["relevantExperience"])
  } else if (step === 4) {
    // Guidance step - validate guidance and STAR selections
    result = await methods.trigger([
      "albertGuidance",
      "starExamplesCount",
      "starExampleDescriptions"
    ])

    if (result) {
      const count = parseInt(methods.getValues("starExamplesCount") || "0", 10)
      const descriptions = methods.getValues("starExampleDescriptions") || []
      const descValid =
        descriptions.length === count &&
        descriptions.every(d => d.trim().length >= 10 && d.trim().length <= 100)
      result = descValid && !!methods.getValues("albertGuidance")
    }
  }

  // STAR steps
  else {
    const firstStarStep = 5
    const lastStarStep = 4 + starCount * 4

    if (step >= firstStarStep && step <= lastStarStep) {
      const stepInStar = step - firstStarStep
      const exampleIndex = Math.floor(stepInStar / 4)
      const subStepIndex = stepInStar % 4

      if (subStepIndex === 0) {
        // Situation step
        result = await methods.trigger([
          `starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`,
          `starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`
        ])
      } else if (subStepIndex === 1) {
        // Task step (constraints required)
        result = await methods.trigger([
          `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`,
          `starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`
        ])
      } else if (subStepIndex === 2) {
        // Action step
        result = await methods.trigger([
          `starExamples.${exampleIndex}.action.steps`
        ])
      } else if (subStepIndex === 3) {
        // Result step (single question)
        result = await methods.trigger([
          `starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`
        ])
      }
    }
    // Final review step
    else {
      result = true
    }
  }

  console.log(`Step ${step} validation result:`, result)
  return result
}
