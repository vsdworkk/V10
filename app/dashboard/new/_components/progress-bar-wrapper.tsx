"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction
} from "react"
import ProgressBar from "./progress-bar"

/**
 * The context object used by the wizard to track progress.
 * 
 * - currentStep: which step the user is currently on (1-based index).
 * - totalSteps: the total number of steps in the wizard (dynamically set).
 * - completedSteps: array of steps (by index) that are completed.
 * - setCurrentStep: updates the current step.
 * - setTotalSteps: updates the total step count (e.g., if user picks 5 STAR examples).
 * - markStepCompleted: marks a step as completed so the progress bar can reflect it.
 */
export const StepContext = createContext<{
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  setCurrentStep: Dispatch<SetStateAction<number>>
  setTotalSteps: Dispatch<SetStateAction<number>>
  markStepCompleted: (step: number) => void
}>({
  currentStep: 1,
  totalSteps: 1,
  completedSteps: [],
  setCurrentStep: () => {},
  setTotalSteps: () => {},
  markStepCompleted: () => {}
})

// Hook to consume the step context
export const useStepContext = () => useContext(StepContext)

interface ProgressBarWrapperProps {
  children?: ReactNode
}

/**
 * @function ProgressBarWrapper
 * Provides a step context to children and shows the progress bar at the top.
 */
export default function ProgressBarWrapper({ children }: ProgressBarWrapperProps) {
  // By default, start at step 1, totalSteps 1 (or 0 if you prefer), and no completed steps.
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps, setTotalSteps] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  /**
   * Mark a specific step number as completed.
   */
  const markStepCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
    }
  }

  return (
    <StepContext.Provider
      value={{
        currentStep,
        totalSteps,
        completedSteps,
        setCurrentStep,
        setTotalSteps,
        markStepCompleted
      }}
    >
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
      />
      {children}
    </StepContext.Provider>
  )
}