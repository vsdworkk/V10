/*
Contains types for the action steps feature.
Updated to match new schema with kebab-case question fields.
*/

export interface ActionStep {
  // UI-specific properties
  id: string
  position: number
  isCompleted: boolean

  // Maps to the specific questions in database schema
  "what-did-you-specifically-do-in-this-step": string
  "what-was-the-outcome-of-this-step-optional"?: string

  // Legacy properties - to be removed after migration
  title?: string
  description?: string
}

export interface ActionStepFormData {
  "what-did-you-specifically-do-in-this-step": string
  "what-was-the-outcome-of-this-step-optional"?: string
  title?: string
  description?: string
}
