// Validation helpers for the pitch wizard steps
import { UseFormReturn } from "react-hook-form"
import { PitchWizardFormData } from "./schema"
import { debugLog } from "@/lib/debug"

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
    result = await methods.trigger(["albertGuidance", "starExamplesCount"])

    if (result) {
      result = !!methods.getValues("albertGuidance")
    }
  } else if (step === 5) {
    // STAR Examples Introduction step - no validation needed (informational only)
    result = true
  }

  // STAR steps
  else {
    const firstStarStep = 6 // Adjusted for new intro step
    const lastStarStep = 5 + starCount * 4 // Adjusted for new intro step

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

        // If validation failed, trigger shake animation for invalid fields
        if (!result) {
          const errors = methods.formState.errors
          const failedFields: string[] = []

          const whereWhenFieldName = `starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`
          const situationFieldName = `starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`

          // Check which specific fields have errors
          if (
            errors.starExamples?.[exampleIndex]?.situation?.[
              "where-and-when-did-this-experience-occur"
            ]
          ) {
            failedFields.push(whereWhenFieldName)
          }
          if (
            errors.starExamples?.[exampleIndex]?.situation?.[
              "briefly-describe-the-situation-or-challenge-you-faced"
            ]
          ) {
            failedFields.push(situationFieldName)
          }

          // If we couldn't determine specific fields, shake all situation fields
          if (failedFields.length === 0) {
            failedFields.push(whereWhenFieldName, situationFieldName)
          }

          // Dispatch shake event
          window.dispatchEvent(
            new CustomEvent("wordCountShake", {
              detail: { fieldNames: failedFields }
            })
          )
        }
      } else if (subStepIndex === 1) {
        // Task step
        result = await methods.trigger([
          `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`
        ])

        // If validation failed, trigger shake animation for invalid fields
        if (!result) {
          const errors = methods.formState.errors
          const failedFields: string[] = []

          const responsibilityFieldName = `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`

          // Check which specific fields have errors
          if (
            errors.starExamples?.[exampleIndex]?.task?.[
              "what-was-your-responsibility-in-addressing-this-issue"
            ]
          ) {
            failedFields.push(responsibilityFieldName)
          }

          // If we couldn't determine specific fields, shake all task fields
          if (failedFields.length === 0) {
            failedFields.push(responsibilityFieldName)
          }

          // Dispatch shake event
          window.dispatchEvent(
            new CustomEvent("wordCountShake", {
              detail: { fieldNames: failedFields }
            })
          )
        }
      } else if (subStepIndex === 2) {
        // Action step
        result = await methods.trigger([
          `starExamples.${exampleIndex}.action.steps`
        ])

        // If validation failed, trigger shake animation for action step fields
        if (!result) {
          const errors = methods.formState.errors
          const failedFields: string[] = []

          // Action steps are more complex - check each step in the array
          const actionSteps = errors.starExamples?.[exampleIndex]?.action?.steps
          if (actionSteps && Array.isArray(actionSteps)) {
            actionSteps.forEach((stepError, stepIndex) => {
              if (stepError?.["what-did-you-specifically-do-in-this-step"]) {
                failedFields.push(
                  `starExamples.${exampleIndex}.action.steps.${stepIndex}.what-did-you-specifically-do-in-this-step`
                )
              }
            })
          }

          // If we couldn't determine specific fields, shake all visible action fields
          if (failedFields.length === 0) {
            const currentSteps =
              methods.getValues(`starExamples.${exampleIndex}.action.steps`) ||
              []
            currentSteps.forEach((_, stepIndex) => {
              failedFields.push(
                `starExamples.${exampleIndex}.action.steps.${stepIndex}.what-did-you-specifically-do-in-this-step`
              )
            })
          }

          // Dispatch shake event
          if (failedFields.length > 0) {
            window.dispatchEvent(
              new CustomEvent("wordCountShake", {
                detail: { fieldNames: failedFields }
              })
            )
          }
        }
      } else if (subStepIndex === 3) {
        // Result step (single question)
        result = await methods.trigger([
          `starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`
        ])

        // If validation failed, trigger shake animation for result field
        if (!result) {
          const errors = methods.formState.errors
          const resultFieldName = `starExamples.${exampleIndex}.result.how-did-this-outcome-benefit-your-team-stakeholders-or-organization`

          // Check if the result field has errors
          if (
            errors.starExamples?.[exampleIndex]?.result?.[
              "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
            ]
          ) {
            // Dispatch shake event
            window.dispatchEvent(
              new CustomEvent("wordCountShake", {
                detail: { fieldNames: [resultFieldName] }
              })
            )
          }
        }
      }
    }
    // Final review step
    else {
      result = true
    }
  }

  debugLog(`Step ${step} validation result:`, result)
  return result
}
