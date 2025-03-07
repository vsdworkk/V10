"use client"

import { createContext, useContext, useState } from "react"
import ProgressBar from "./progress-bar"

// Create a context to share step information
export const StepContext = createContext<{
  currentStep: number
  totalSteps: number
  setCurrentStep: (step: number) => void
  setTotalSteps: (steps: number) => void
}>({
  currentStep: 1,
  totalSteps: 12,
  setCurrentStep: () => {},
  setTotalSteps: () => {}
})

// Hook to use the step context
export const useStepContext = () => useContext(StepContext)

// Wrapper component that provides the context
export default function ProgressBarWrapper() {
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps, setTotalSteps] = useState(12)

  return (
    <StepContext.Provider 
      value={{ 
        currentStep, 
        totalSteps, 
        setCurrentStep, 
        setTotalSteps 
      }}
    >
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
    </StepContext.Provider>
  )
} 