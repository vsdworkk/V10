"use client"

import { useMemo } from "react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
}

/**
 * @function ProgressBar
 * Displays a horizontal bar indicating overall wizard progress, plus text 
 * showing how many steps are completed and the current step number.
 */
export default function ProgressBar({
  currentStep,
  totalSteps,
  completedSteps
}: ProgressBarProps) {
  
  // Calculate progress as a percentage
  const progressPercent = useMemo(() => {
    // Edge case: if totalSteps is 0, avoid dividing by zero
    if (totalSteps <= 0) return 0

    // If we're at the first step and nothing is completed, show minimal progress
    if (currentStep === 1 && completedSteps.length === 0) {
      return (1 / totalSteps) * 100
    }

    // Otherwise, show progress based on how many steps are completed + the current step
    // e.g., if 3 steps are completed, and user is on step 4, that's effectively 4 steps done.
    const effectiveCompleted = completedSteps.length + 1 // current step "in progress"
    const fraction = effectiveCompleted / totalSteps

    return Math.min(fraction * 100, 100)
  }, [currentStep, totalSteps, completedSteps])

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">
          {completedSteps.length} of {totalSteps} completed
        </span>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="relative">
        {/* The background of the progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}