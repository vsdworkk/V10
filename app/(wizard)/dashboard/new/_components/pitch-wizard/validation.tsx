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
      "pitchWordLimit"
    ])
  } else if (step === 3) {
    // Experience step
    result = await methods.trigger(["roleDescription", "relevantExperience"])
  } else if (step === 4) {
    // Guidance step - optional
    result = true
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
        // Task step
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
        // Result step
        result = await methods.trigger([
          `starExamples.${exampleIndex}.result.what-positive-outcome-did-you-achieve`,
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
