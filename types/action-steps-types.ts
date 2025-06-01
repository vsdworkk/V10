/*
Contains types for the action steps feature.
Updated to match new schema with kebab-case question fields.
*/

/**
 * Interface representing a single step in the action section.
 * Each step has a number, ID for UI management, and captures
 * what you did and the outcome.
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

export type ActionStepFormData = Omit<
  ActionStep,
  "id" | "position" | "isCompleted"
>
