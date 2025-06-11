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
        
        // If validation failed, trigger shake animation for invalid fields
        if (!result) {
          const errors = methods.formState.errors
          const failedFields: string[] = []
          
          const whereWhenFieldName = `starExamples.${exampleIndex}.situation.where-and-when-did-this-experience-occur`
          const situationFieldName = `starExamples.${exampleIndex}.situation.briefly-describe-the-situation-or-challenge-you-faced`
          
          // Check which specific fields have errors
          if (errors.starExamples?.[exampleIndex]?.situation?.['where-and-when-did-this-experience-occur']) {
            failedFields.push(whereWhenFieldName)
          }
          if (errors.starExamples?.[exampleIndex]?.situation?.['briefly-describe-the-situation-or-challenge-you-faced']) {
            failedFields.push(situationFieldName)
          }
          
          // If we couldn't determine specific fields, shake all situation fields
          if (failedFields.length === 0) {
            failedFields.push(whereWhenFieldName, situationFieldName)
          }
          
          // Dispatch shake event
          window.dispatchEvent(new CustomEvent('wordCountShake', {
            detail: { fieldNames: failedFields }
          }))
        }
      } else if (subStepIndex === 1) {
        // Task step (constraints required)
        result = await methods.trigger([
          `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`,
          `starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`
        ])
        
        // If validation failed, trigger shake animation for invalid fields
        if (!result) {
          const errors = methods.formState.errors
          const failedFields: string[] = []
          
          const responsibilityFieldName = `starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`
          const constraintsFieldName = `starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`
          
          // Check which specific fields have errors
          if (errors.starExamples?.[exampleIndex]?.task?.['what-was-your-responsibility-in-addressing-this-issue']) {
            failedFields.push(responsibilityFieldName)
          }
          if (errors.starExamples?.[exampleIndex]?.task?.['what-constraints-or-requirements-did-you-need-to-consider']) {
            failedFields.push(constraintsFieldName)
          }
          
          // If we couldn't determine specific fields, shake all task fields
          if (failedFields.length === 0) {
            failedFields.push(responsibilityFieldName, constraintsFieldName)
          }
          
          // Dispatch shake event
          window.dispatchEvent(new CustomEvent('wordCountShake', {
            detail: { fieldNames: failedFields }
          }))
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
              if (stepError?.['what-did-you-specifically-do-in-this-step']) {
                failedFields.push(`starExamples.${exampleIndex}.action.steps.${stepIndex}.what-did-you-specifically-do-in-this-step`)
              }
              if (stepError?.['what-was-the-outcome-of-this-step-optional']) {
                failedFields.push(`starExamples.${exampleIndex}.action.steps.${stepIndex}.what-was-the-outcome-of-this-step-optional`)
              }
            })
          }
          
          // If we couldn't determine specific fields, shake all visible action fields
          if (failedFields.length === 0) {
            const currentSteps = methods.getValues(`starExamples.${exampleIndex}.action.steps`) || []
            currentSteps.forEach((_, stepIndex) => {
              failedFields.push(`starExamples.${exampleIndex}.action.steps.${stepIndex}.what-did-you-specifically-do-in-this-step`)
              failedFields.push(`starExamples.${exampleIndex}.action.steps.${stepIndex}.what-was-the-outcome-of-this-step-optional`)
            })
          }
          
          // Dispatch shake event
          if (failedFields.length > 0) {
            window.dispatchEvent(new CustomEvent('wordCountShake', {
              detail: { fieldNames: failedFields }
            }))
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
          if (errors.starExamples?.[exampleIndex]?.result?.['how-did-this-outcome-benefit-your-team-stakeholders-or-organization']) {
            // Dispatch shake event
            window.dispatchEvent(new CustomEvent('wordCountShake', {
              detail: { fieldNames: [resultFieldName] }
            }))
          }
        }
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
