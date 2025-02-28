/**
 * @description
 * Client sub-component for wizard Step 4: Review / Confirmation.
 * Displays all user-provided data so they can confirm before submission.
 *
 * Key Features:
 * - Reads data from the form context and renders it in a read-only view.
 *
 * @dependencies
 * - React Hook Form
 *
 * @notes
 * - Submission is triggered in the parent wizard on "Submit"
 */

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"

export default function ReviewStep() {
  const { getValues } = useFormContext<PitchWizardFormData>()
  const data = getValues()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review Your Data</h3>

      <div className="text-sm space-y-2">
        <p><strong>Role Name:</strong> {data.roleName}</p>
        <p><strong>Role Level:</strong> {data.roleLevel}</p>
        <p><strong>Word Limit:</strong> {data.pitchWordLimit}</p>
        <p><strong>Role Description:</strong> {data.roleDescription}</p>
        <p><strong>Years of Experience:</strong> {data.yearsExperience}</p>
        <p><strong>Relevant Experience:</strong> {data.relevantExperience}</p>
      </div>

      {/* STAR Example 1 */}
      <div className="text-sm space-y-1">
        <p className="font-semibold">STAR Example 1:</p>
        <p><strong>Situation:</strong> {data.starExample1.situation}</p>
        <p><strong>Task:</strong> {data.starExample1.task}</p>
        <p><strong>Action:</strong> {data.starExample1.action}</p>
        <p><strong>Result:</strong> {data.starExample1.result}</p>
      </div>

      {/* STAR Example 2 (if present) */}
      {data.starExample2 && (
        <div className="text-sm space-y-1">
          <p className="font-semibold">STAR Example 2:</p>
          <p><strong>Situation:</strong> {data.starExample2.situation}</p>
          <p><strong>Task:</strong> {data.starExample2.task}</p>
          <p><strong>Action:</strong> {data.starExample2.action}</p>
          <p><strong>Result:</strong> {data.starExample2.result}</p>
        </div>
      )}

      <p className="text-muted-foreground">
        When you click Submit, your pitch is saved as a draft.
      </p>
    </div>
  )
}