"use client"

import { useStepContext } from "./progress-bar-wrapper"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"

export default function DynamicHeader() {
  const { currentStep, totalSteps } = useStepContext()
  
  // Get form context, but handle null case
  const formContext = useFormContext<PitchWizardFormData>()
  
  // Get the number of STAR examples the user has selected (default to 2)
  // Safely use watch only if formContext exists
  const starExamplesCount = formContext?.watch ? 
    parseInt(formContext.watch("starExamplesCount") || "2") : 
    2
    
  const wordLimit = formContext?.watch ? 
    formContext.watch("pitchWordLimit") || 650 : 
    650
  
  // Determine the header text based on the current step
  function getHeaderText() {
    if (currentStep === 1) {
      return "Role Details"
    } else if (currentStep === 2) {
      return "Experience"
    } else if (currentStep === 3) {
      return "Guidance"
    } else if (currentStep >= 4 && currentStep <= 7) {
      return "STAR Example #1"
    } else if (currentStep >= 8 && currentStep <= 11) {
      // Show the correct example number based on whether we're showing example 2 or 3
      return `STAR Example #2`
    } else if (currentStep === 12) {
      return "Finalise Pitch"
    } else {
      return "Pitch Wizard"
    }
  }

  // Determine the subtitle based on the current step
  function getSubtitle() {
    if (currentStep === 1) {
      return "Follow the steps below to create a tailored pitch for your APS application."
    } else if (currentStep === 2) {
      return "Tell us about your relevant experience for this role."
    } else if (currentStep === 3) {
      return "Review Albert's guidance to help craft your STAR examples."
    } else if (currentStep === 4) {
      return "Describe the context and background of your first example."
    } else if (currentStep === 5) {
      return "Explain your responsibilities in this first example."
    } else if (currentStep === 6) {
      return "Detail the specific actions you took in your first example."
    } else if (currentStep === 7) {
      return "Share the results and impact of your first example."
    } else if (currentStep === 8) {
      return "Describe the context and background of your second example."
    } else if (currentStep === 9) {
      return "Explain your responsibilities in this second example."
    } else if (currentStep === 10) {
      return "Detail the specific actions you took in your second example."
    } else if (currentStep === 11) {
      return "Share the results and impact of your second example."
    } else if (currentStep === 12) {
      return ""
    } else {
      return "Follow the steps below to create a tailored pitch for your APS application."
    }
  }

  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{getHeaderText()}</h1>
      <p className="text-muted-foreground mt-2">
        {getSubtitle()}
      </p>
    </div>
  )
} 