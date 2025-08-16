import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/hooks/use-toast"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import type { Section } from "@/types"

import { savePitchData, triggerFinalPitch, submitFinalPitch } from "./api"
import { PitchWizardFormData, pitchWizardSchema } from "./schema"
import { validateStep } from "./validation"
import {
  computeSectionAndHeader,
  firstStepOfSection,
  mapExistingDataToDefaults
} from "./helpers"

interface UseWizardOptions {
  userId: string
  pitchData?: SelectPitch
  initialStep?: number
}

export function useWizard({
  userId,
  pitchData,
  initialStep
}: UseWizardOptions) {
  const router = useRouter()
  const { toast } = useToast()

  // Local wizard state
  const [currentStep, setCurrentStep] = useState(() => {
    // Priority order: initialStep prop > URL search params > pitchData > default
    if (initialStep && Number.isInteger(initialStep) && initialStep > 0) {
      return initialStep
    }

    // Check URL search params for step
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const stepParam = urlParams.get("step")
      if (stepParam) {
        const stepFromUrl = parseInt(stepParam, 10)
        if (!isNaN(stepFromUrl) && stepFromUrl > 0) {
          return stepFromUrl
        }
      }
    }

    return pitchData?.currentStep || 1
  })

  const [pitchId, setPitchId] = useState<string | undefined>(
    pitchData?.id || undefined
  )

  const [isPitchLoading, setIsPitchLoading] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isSavingInBackground, setIsSavingInBackground] = useState(false)

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const pendingFormDataRef = useRef<PitchWizardFormData | null>(null)

  // Track if pitch generation has been confirmed
  const [isPitchGenerationConfirmed, setIsPitchGenerationConfirmed] =
    useState(false)

  // React Hook Form setup
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: mapExistingDataToDefaults(userId, pitchData),
    mode: "onChange",
    delayError: 0
  })

  // Watch for starExamplesCount
  const starCount = parseInt(methods.watch("starExamplesCount") || "2", 10)
  const totalSteps = 4 + 1 + starCount * 4 + 1 // Added 1 for the STAR intro step

  // Get current section and header
  const { section: currentSection, header: currentHeader } =
    computeSectionAndHeader(currentStep, starCount)

  // Keep track of previous step for animations
  const prevStepRef = useRef(1)

  // Save pitchId to sessionStorage
  useEffect(() => {
    if (pitchId) {
      sessionStorage.setItem("ongoingPitchId", pitchId)
    } else {
      sessionStorage.removeItem("ongoingPitchId")
    }
  }, [pitchId])

  // Disable form fields when pitch generation is confirmed
  useEffect(() => {
    if (isPitchGenerationConfirmed && !isPitchLoading) {
      // Lock the form by setting it to readOnly mode
      const formElement = document.querySelector("form")
      if (formElement) {
        const inputs = formElement.querySelectorAll("input, textarea, select")
        inputs.forEach((input: Element) => {
          if (input instanceof HTMLElement) {
            input.setAttribute("readonly", "true")
            input.setAttribute("disabled", "true")
          }
        })
      }

      // Also disable sidebar navigation items (except for the FINAL section)
      const sidebarLinks = document.querySelectorAll("[data-section]")
      sidebarLinks.forEach((link: Element) => {
        if (link instanceof HTMLElement) {
          const section = link.dataset.section
          if (section && section !== "FINAL") {
            link.classList.add("opacity-50", "pointer-events-none")
            link.setAttribute("aria-disabled", "true")

            // Add a tooltip explaining why it's disabled
            link.setAttribute(
              "title",
              "Navigation locked: Pitch generation has started"
            )
          }
        }
      })
    }
  }, [isPitchGenerationConfirmed, isPitchLoading])

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

        // If pitch generation is confirmed, only allow navigation to FINAL section
        if (isPitchGenerationConfirmed && targetSection !== "FINAL") {
          toast({
            title: "Navigation locked",
            description:
              "You can't go back after pitch generation has started.",
            variant: "destructive"
          })
          return
        }

        const targetStep = firstStepOfSection(targetSection, starCount)
        savePitchData(
          methods.getValues(),
          pitchId,
          setPitchId,
          toast,
          targetStep
        )
        setCurrentStep(targetStep)
      }
    }

    window.addEventListener("sectionNavigate", handleSectionNavigate)
    return () =>
      window.removeEventListener("sectionNavigate", handleSectionNavigate)
  }, [
    starCount,
    isPitchGenerationConfirmed,
    toast,
    methods,
    pitchId,
    setPitchId
  ])

  // Persist step changes automatically (debounced)
  useEffect(() => {
    if (!pitchId || currentStep <= 1) return
    const timeout = setTimeout(() => {
      setIsSavingInBackground(true)
      savePitchData(
        methods.getValues(),
        pitchId,
        setPitchId,
        toast,
        currentStep
      ).finally(() => {
        setIsSavingInBackground(false)
      })
    }, 1000)

    return () => clearTimeout(timeout)
  }, [currentStep, pitchId, methods, setPitchId, toast])

  // Sync URL with current step - USE SEARCH PARAMS INSTEAD OF ROUTE CHANGES
  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    const currentStepParam = currentUrl.searchParams.get("step")

    // Only update URL if step has actually changed
    if (parseInt(currentStepParam || "1") !== currentStep) {
      currentUrl.searchParams.set("step", currentStep.toString())

      // Use replaceState to avoid server round-trips
      window.history.replaceState({}, "", currentUrl.toString())
    }
  }, [currentStep])

  const clearCachedPitchId = () => {
    sessionStorage.removeItem("ongoingPitchId")
    setPitchId(undefined)
  }

  // Handler for navigating to a specific section
  const handleSectionNavigate = useCallback(
    async (target: Section) => {
      // If pitch generation is confirmed, only allow navigation to FINAL section
      if (isPitchGenerationConfirmed && target !== "FINAL") {
        toast({
          title: "Navigation locked",
          description: "You can't go back after pitch generation has started.",
          variant: "destructive"
        })
        return
      }

      const targetStep = firstStepOfSection(target, starCount)
      if (targetStep <= currentStep) {
        // Advance UI immediately for better UX
        setCurrentStep(targetStep)

        // Save data to database in background (non-blocking)
        setIsSavingInBackground(true)
        savePitchData(
          methods.getValues(),
          pitchId,
          setPitchId,
          toast,
          targetStep
        )
          .catch(error => {
            console.error("Section navigation save failed:", error)

            // Show user-friendly error without blocking navigation
            toast({
              title: "Save Warning",
              description: "Your progress will be saved automatically.",
              variant: "default"
            })
          })
          .finally(() => {
            setIsSavingInBackground(false)
          })
      }
    },
    [
      currentStep,
      starCount,
      isPitchGenerationConfirmed,
      toast,
      methods,
      pitchId,
      setPitchId
    ]
  )

  // Handler for proceeding with pitch generation
  const handleConfirmPitchGeneration = useCallback(async () => {
    const lastStarStep = 5 + starCount * 4

    // Only proceed if we've saved form data and we're at the last STAR step
    if (pendingFormDataRef.current && currentStep === lastStarStep) {
      // Close the confirmation dialog
      setShowConfirmDialog(false)

      // Navigate to the review step
      setCurrentStep(lastStarStep + 1)
      setIsPitchLoading(true)
      setFinalPitchError(null)

      // Mark pitch generation as confirmed
      setIsPitchGenerationConfirmed(true)

      try {
        await triggerFinalPitch(
          pendingFormDataRef.current,
          pitchId,
          methods,
          setPitchId,
          toast,
          setIsPitchLoading,
          setFinalPitchError,
          lastStarStep + 1
        )
      } catch (err) {
        // Error handling is done in the triggerFinalPitch function
        // Even if there's an error, we keep isPitchGenerationConfirmed true
        // to prevent going back and changing inputs
      }

      // Clear the pending form data
      pendingFormDataRef.current = null
    }
  }, [currentStep, methods, pitchId, starCount, toast])

  // Handler for cancelling pitch generation
  const handleCancelPitchGeneration = useCallback(() => {
    setShowConfirmDialog(false)
    pendingFormDataRef.current = null
  }, [])

  // Handler for "Next" button
  const handleNext = useCallback(async () => {
    if (isNavigating) return

    const nextStep = Math.min(currentStep + 1, totalSteps)

    // Intro step (step 1) and STAR Examples Intro step (step 5) have no validation
    if (currentStep === 1 || currentStep === 5) {
      setCurrentStep(nextStep)
      return
    }

    setIsNavigating(true)

    try {
      // STEP 1: Fast local validation (blocking) - must pass to proceed
      const isValid = await validateStep(currentStep, starCount, methods)
      if (!isValid) {
        // Validation failed - do not advance and do not save
        return
      }

      // STEP 2: Handle special case for moving to pitch generation BEFORE advancing UI
      const lastStarStep = 5 + starCount * 4 // Adjusted for new intro step
      if (currentStep === lastStarStep) {
        // Store the form data for pitch generation confirmation
        const formData = methods.getValues()
        pendingFormDataRef.current = formData

        // Save data in background before showing confirmation dialog
        setIsSavingInBackground(true)
        savePitchData(formData, pitchId, setPitchId, toast, currentStep)
          .catch(error => {
            console.error("Failed to save before pitch generation:", error)
            // Don't show error toast here - the auto-save will handle retry
          })
          .finally(() => {
            setIsSavingInBackground(false)
          })

        // Show the confirmation dialog WITHOUT advancing the UI yet
        setShowConfirmDialog(true)
        return
      }

      // STEP 3: Advance UI for all other steps (not the last STAR step)
      setCurrentStep(nextStep)

      // STEP 4: Save data to database in background (non-blocking)
      const formData = methods.getValues()
      setIsSavingInBackground(true)
      savePitchData(formData, pitchId, setPitchId, toast, nextStep)
        .catch(error => {
          console.error("Background save failed:", error)

          // Show user-friendly error without blocking their progress
          toast({
            title: "Save Warning",
            description:
              "Your progress will be saved automatically. You can continue working.",
            variant: "default" // Use default instead of destructive to be less alarming
          })

          // The auto-save effect will retry the save operation
        })
        .finally(() => {
          setIsSavingInBackground(false)
        })
    } catch (error) {
      console.error("Unexpected error in handleNext:", error)

      // Handle unexpected validation errors gracefully
      toast({
        title: "Validation Error",
        description: "Please check your inputs and try again.",
        variant: "destructive"
      })
    } finally {
      setIsNavigating(false)
    }
  }, [
    currentStep,
    starCount,
    totalSteps,
    methods,
    pitchId,
    setPitchId,
    toast,
    isNavigating
  ])

  // Handler for "Back" button
  const handleBack = useCallback(() => {
    if (isNavigating) return

    // If pitch generation is confirmed, prevent going back
    if (isPitchGenerationConfirmed) {
      toast({
        title: "Navigation locked",
        description: "You can't go back after pitch generation has started.",
        variant: "destructive"
      })
      return
    }

    setCurrentStep(s => Math.max(s - 1, 1))
  }, [isPitchGenerationConfirmed, toast, isNavigating])

  // Handler for "Save & Close" button
  const handleSaveAndClose = useCallback(async () => {
    const { isDirty } = methods.formState

    if (!isDirty) {
      clearCachedPitchId()
      router.push("/dashboard")
      return
    }

    const data = methods.getValues()

    try {
      // Await the save to ensure pitchId is set before navigating away
      await savePitchData(data, pitchId, setPitchId, toast, currentStep)
      clearCachedPitchId()
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to save before navigating:", error)
      toast({
        title: "Save Error",
        description: "We couldn’t save your pitch. Please try again.",
        variant: "destructive"
      })
    }
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

  const retryPitchGeneration = () => {
    const lastStarStep = 5 + starCount * 4
    setCurrentStep(lastStarStep)

    // Load the last saved form data into pendingFormDataRef
    pendingFormDataRef.current = methods.getValues()

    // Show confirmation after the UI updates
    setTimeout(() => {
      setShowConfirmDialog(true)
    }, 0)
  }

  // Add event listener for "saveAndExit"
  useEffect(() => {
    const handleSaveAndExit = async () => {
      await handleSaveAndClose()
    }

    window.addEventListener("saveAndExit", handleSaveAndExit)
    return () => {
      window.removeEventListener("saveAndExit", handleSaveAndExit)
    }
  }, [handleSaveAndClose])

  return {
    // Form state
    methods,
    // Step management
    currentStep,
    totalSteps,
    currentSection,
    currentHeader,
    starCount,
    // Pitch ID state
    pitchId,
    setPitchId,
    // Loading states
    isPitchLoading,
    finalPitchError,
    isNavigating,
    isSavingInBackground,
    // Confirmation dialog state
    showConfirmDialog,
    setShowConfirmDialog,
    handleConfirmPitchGeneration,
    handleCancelPitchGeneration,
    // Pitch generation status
    isPitchGenerationConfirmed,
    // Actions
    handleNext,
    handleBack,
    handleSaveAndClose,
    handleSubmitFinal,
    handleSectionNavigate,
    handlePitchLoaded,
    // Retry pitch generation
    retryPitchGeneration
  }
}
