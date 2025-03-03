/**
@description
Previously, this file contained a single multi-field approach for STAR examples.
Now that we have created situation-step, task-step, action-step, and result-step,
we are removing the old combined text areas.

For Step 1, we leave a placeholder here. Step 2 will handle integrating the new
components into the pitch wizard flow (or we may decide to remove this entirely).

@notes
This file currently does not render anything (placeholder).
*/

"use client"

export default function StarStep() {
  return (
    <div>
      {/* Placeholder: old logic removed. The new sub-steps replace it. */}
      <p className="text-sm text-muted-foreground">
        [STAR Step placeholder: old text fields removed in Step 1]
      </p>
    </div>
  )
}