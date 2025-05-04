import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/hooks/use-toast"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import type { Section } from "@/types"

import { PitchWizardFormData, pitchWizardSchema } from "./schema"
import { computeSectionAndHeader, firstStepOfSection, mapExistingDataToDefaults } from "./helpers"
import { savePitchData, triggerFinalPitch, submitFinalPitch } from "./api"
import { validateStep } from "./validation"

interface UseWizardOptions {
  userId: string
  pitchData?: SelectPitch
}

export function useWizard({ userId, pitchData }: UseWizardOptions) {
  const router = useRouter()
  const { toast } = useToast()

  // Local wizard state
  const [currentStep, setCurrentStep] = useState(pitchData?.currentStep || 1)
  const [pitchId, setPitchId] = useState<string | undefined>(pitchData?.id)
  const [isPitchLoading, setIsPitchLoading] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)
  
  // React Hook Form setup
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: mapExistingDataToDefaults(userId, pitchData),
    mode: "onTouched",
    delayError: 0,
  })

  // Watch for starExamplesCount
  const starCount = parseInt(methods.watch("starExamplesCount") || "1", 10)
  const totalSteps = 4 + starCount * 4 + 1

  // Get current section and header
  const { section: currentSection, header: currentHeader } = computeSectionAndHeader(currentStep, starCount)

  // Keep track of previous step for animations
  const prevStepRef = useRef(1)

  // Emit current section whenever step changes
  useEffect(() => {
    // Compute the current section whenever the step changes
    const { section } = computeSectionAndHeader(currentStep, starCount)
    
    // Dispatch a custom event to notify the layout that the section changed
    const isForwardNavigation = currentStep > prevStepRef.current
    const event = new CustomEvent("sectionChange", { 
      detail: { 
        section,
        isForwardNavigation
      } 
    })
    window.dispatchEvent(event)
    
    // Keep track of previous step
    prevStepRef.current = currentStep
  }, [currentStep, starCount])

  // Listen for section navigation events from the sidebar
  useEffect(() => {
    const handleSectionNavigate = (e: any) => {
      if (e.detail && e.detail.section) {
        const targetSection = e.detail.section
        const targetStep = firstStepOfSection(targetSection, starCount)
        setCurrentStep(targetStep)
      }
    }
    
    window.addEventListener("sectionNavigate", handleSectionNavigate)
    return () => window.removeEventListener("sectionNavigate", handleSectionNavigate)
  }, [starCount])

  // Handler for navigating to a specific section
  const handleSectionNavigate = useCallback(
    (target: Section) => {
      const targetStep = firstStepOfSection(target, starCount)
      if (targetStep <= currentStep) {
        setCurrentStep(targetStep)
      }
    },
    [currentStep, starCount]
  )

  // Validate fields for the current step
  // Removed inline validateCurrentStep function

  // Handler for "Next" button
  const handleNext = useCallback(async () => {
    // Intro step (step 1) has no validation
    if (currentStep === 1) {
      setCurrentStep(2)
      return
    }

    // Validate current step fields
    const isValid = await validateStep(currentStep, starCount, methods)
    if (!isValid) return

    // Save current step's data
    const formData = methods.getValues()
    await savePitchData(formData, pitchId, setPitchId, toast, currentStep)

    // Check if we're moving from last STAR step to review
    const lastStarStep = 4 + starCount * 4
    if (currentStep === lastStarStep) {
      setCurrentStep(lastStarStep + 1)
      setIsPitchLoading(true)
      setFinalPitchError(null)

      try {
        await triggerFinalPitch(
          formData, 
          pitchId, 
          methods, 
          setPitchId, 
          toast, 
          setIsPitchLoading, 
          setFinalPitchError, 
          currentStep
        )
      } catch (err) {
        // Error handling is done in the triggerFinalPitch function
      }
      return
    }

    // Proceed to next step
    setCurrentStep((s) => Math.min(s + 1, totalSteps))
  }, [currentStep, starCount, totalSteps, methods, pitchId, toast])

  // Handler for "Back" button
  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }, [])

  // Handler for "Save & Close" button
  const handleSaveAndClose = useCallback(async () => {
    const data = methods.getValues()
    await savePitchData(data, pitchId, setPitchId, toast, currentStep)
    router.push("/dashboard")
  }, [methods, pitchId, currentStep, toast, router])

  // Handler for "Submit Pitch" button
  const handleSubmitFinal = useCallback(async () => {
    const data = methods.getValues()
    await submitFinalPitch(data, pitchId, setPitchId, toast, router)
  }, [methods, pitchId, toast, router])

  // Handler for pitch loading completion
  const handlePitchLoaded = useCallback(() => {
    setIsPitchLoading(false)
    setFinalPitchError(null)
  }, [])

  return {
    // Form state
    methods,
    // Step management
    currentStep,
    totalSteps,
    currentSection,
    currentHeader,
    starCount,
    // Loading states
    isPitchLoading,
    finalPitchError,
    // Actions
    handleNext,
    handleBack,
    handleSaveAndClose,
    handleSubmitFinal,
    handleSectionNavigate,
    handlePitchLoaded
  }
}