"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import ProgressBar from "./progress-bar"

// Create a context to share step information
export const StepContext = createContext<{
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  setCurrentStep: (step: number) => void
  setTotalSteps: (steps: number) => void
  markStepCompleted: (step: number) => void
}>({
  currentStep: 1,
  totalSteps: 12,
  completedSteps: [],
  setCurrentStep: () => {},
  setTotalSteps: () => {},
  markStepCompleted: () => {}
})

// Hook to use the step context
export const useStepContext = () => useContext(StepContext)

// Wrapper component that provides the context
interface ProgressBarWrapperProps {
  children?: ReactNode
}

export default function ProgressBarWrapper({ children }: ProgressBarWrapperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps, setTotalSteps] = useState(12)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Helper function to mark a step as completed
  const markStepCompleted = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step])
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
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} completedSteps={completedSteps} />
      {children}
    </StepContext.Provider>
  )
} 