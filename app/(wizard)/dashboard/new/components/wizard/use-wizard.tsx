
/**
 * @file use-wizard.tsx
 * @description
 * Client hook that orchestrates the APSPitchPro multi-step wizard. Handles:
 * - Step navigation, validation, and persistence
 * - Triggering AI generation and managing loading/error states
 * - Locking navigation after generation confirmation
 * - NEW (Step 5): Introduces a "feedback gate" by exposing `showFeedbackDialog`
 *   and `setShowFeedbackDialog`. On successful final submit, we open the feedback
 *   dialog instead of immediately redirecting. We intercept `router.push` in the
 *   final-submit path to prevent navigation and surface the feedback modal.
 *
 * Key behaviors:
 * - Saves draft data in the background after step changes
 * - Emits custom events for layout-synced section headers and sidebar navigation
 * - Enforces one-way navigation once pitch generation is confirmed
 *
 * Edge cases:
 * - If final generation failed (`finalPitchError` set), "Save and Close" on final
 *   step performs a draft save and navigates to dashboard directly (no feedback).
 * - URL search param `?step=` is kept in sync without server round-trips.
 *
 * Assumptions:
 * - `submitFinalPitch` handles payload creation and DB finalization as before.
 * - We can intercept router.push with a minimal shim to open the feedback dialog.
 */

"use client"

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
  /** Clerk user id for ownership checks downstream */
  userId: string
  /** Optional preloaded pitch row for resuming drafts */
  pitchData?: SelectPitch
  /** Optional initial step override; defaults to 1 or restored step */
  initialStep?: number
}

/**
 * Main hook used by the wizard page. See file header for summary.
 */
export function useWizard({
  userId,
  pitchData,
  initialStep
}: UseWizardOptions) {
  const router = useRouter()
  const { toast } = useToast()

  // -----------------------------
  // Wizard state
  // -----------------------------
  const [currentStep, setCurrentStep] = useState(() => {
    // Priority order: initialStep prop > URL search params > pitchData > default
    if (initialStep && Number.isInteger(initialStep) && initialStep > 0) {
      return initialStep
    }
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
  const [pitchId, setPitchId] = useState<string | undefined>(pitchData?.id || undefined)
  const [isPitchLoading, setIsPitchLoading] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isSavingInBackground, setIsSavingInBackground] = useState(false)

  // Confirmation dialog state for initiating AI generation at the end of STAR
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const pendingFormDataRef = useRef<PitchWizardFormData | null>(null)

  // Once generation is confirmed, disallow going back to mutate inputs.
  const [isPitchGenerationConfirmed, setIsPitchGenerationConfirmed] = useState(false)

  // NEW (Step 5): Feedback dialog state
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  // -----------------------------
  // React Hook Form
  // -----------------------------
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: mapExistingDataToDefaults(userId, pitchData),
    mode: "onChange",
    delayError: 0
  })

  // STAR example count drives total steps
  const starCount = parseInt(methods.watch("starExamplesCount") || "2", 10)
  // Steps: 1 Intro + 1 Role + 1 Exp + 1 Guidance + 1 STAR Intro + 4*count STAR + 1 Final
  const totalSteps = 4 + 1 + starCount * 4 + 1

  // Current section and header for layout sync
  const { section: currentSection, header: currentHeader } = computeSectionAndHeader(
    currentStep,
    starCount
  )

  // Track previous step to know forward/back for animations and layout reset
  const prevStepRef = useRef(1)

  // Persist / clear ongoing pitch id in sessionStorage
  useEffect(() => {
    if (pitchId) {
      sessionStorage.setItem("ongoingPitchId", pitchId)
    } else {
      sessionStorage.removeItem("ongoingPitchId")
    }
  }, [pitchId])

  // Disable form after generation confirms (lock fields and sidebar except FINAL)
  useEffect(() => {
    if (isPitchGenerationConfirmed && !isPitchLoading) {
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
      const sidebarLinks = document.querySelectorAll("[data-section]")
      sidebarLinks.forEach((link: Element) => {
        if (link instanceof HTMLElement) {
          const section = link.dataset.section
          if (section && section !== "FINAL") {
            link.classList.add("opacity-50", "pointer-events-none")
            link.setAttribute("aria-disabled", "true")
            link.setAttribute("title", "Navigation locked: Pitch generation has started")
          }
        }
      })
    }
  }, [isPitchGenerationConfirmed, isPitchLoading])

  // Emit section changes for layout sync and scroll resets
  useEffect(() => {
    const { section } = computeSectionAndHeader(currentStep, starCount)
    const isForwardNavigation = currentStep > prevStepRef.current
    const event = new CustomEvent("sectionChange", {
      detail: {
        section,
        isForwardNavigation
      }
    })
    window.dispatchEvent(event)
    prevStepRef.current = currentStep
  }, [currentStep, starCount])

  // Listen for sidebar-to-wizard section navigation requests
  useEffect(() => {
    const handleSectionNavigate = (e: any) => {
      if (e.detail && e.detail.section) {
        const targetSection = e.detail.section as Section
        if (isPitchGenerationConfirmed && targetSection !== "FINAL") {
          toast({
            title: "Navigation locked",
            description: "You can't go back after pitch generation has started.",
            variant: "destructive"
          })
          return
        }
        const targetStep = firstStepOfSection(targetSection, starCount)
        savePitchData(methods.getValues(), pitchId, setPitchId, toast, targetStep)
        setCurrentStep(targetStep)
      }
    }
    window.addEventListener("sectionNavigate", handleSectionNavigate)
    return () => window.removeEventListener("sectionNavigate", handleSectionNavigate)
  }, [starCount, isPitchGenerationConfirmed, toast, methods, pitchId])

  // Debounced background save when step changes
  useEffect(() => {
    if (!pitchId || currentStep <= 1) return
    const timeout = setTimeout(() => {
      setIsSavingInBackground(true)
      savePitchData(methods.getValues(), pitchId, setPitchId, toast, currentStep).finally(() =>
        setIsSavingInBackground(false)
      )
    }, 1000)
    return () => clearTimeout(timeout)
  }, [currentStep, pitchId, methods, toast])

  // Keep ?step in sync without route transitions
  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    const currentStepParam = currentUrl.searchParams.get("step")
    if (parseInt(currentStepParam || "1") !== currentStep) {
      currentUrl.searchParams.set("step", currentStep.toString())
      window.history.replaceState({}, "", currentUrl.toString())
    }
  }, [currentStep])

  // Utility to clear cached pitch id
  const clearCachedPitchId = () => {
    sessionStorage.removeItem("ongoingPitchId")
    setPitchId(undefined)
  }

  /**
   * Navigate to a specific section initiated by sidebar/header controls.
   */
  const handleSectionNavigate = useCallback(
    async (target: Section) => {
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
        setCurrentStep(targetStep)
        setIsSavingInBackground(true)
        savePitchData(methods.getValues(), pitchId, setPitchId, toast, targetStep)
          .catch((error) => {
            console.error("Section navigation save failed:", error)
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
    [currentStep, starCount, isPitchGenerationConfirmed, toast, methods, pitchId]
  )

  /**
   * Confirm and trigger final AI generation when user completes STAR input.
   * Shows confirmation dialog at the boundary between STAR and FINAL.
   */
  const handleConfirmPitchGeneration = useCallback(async () => {
    const lastStarStep = 5 + starCount * 4
    if (pendingFormDataRef.current && currentStep === lastStarStep) {
      setShowConfirmDialog(false)
      setCurrentStep(lastStarStep + 1)
      setIsPitchLoading(true)
      setFinalPitchError(null)
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
      } catch {
        // Errors are handled in triggerFinalPitch
        // Keep `isPitchGenerationConfirmed` true to prevent going back
      }
      pendingFormDataRef.current = null
    }
  }, [currentStep, methods, pitchId, starCount, toast])

  /** Close the pitch-generation confirmation dialog without proceeding */
  const handleCancelPitchGeneration = useCallback(() => {
    setShowConfirmDialog(false)
    pendingFormDataRef.current = null
  }, [])

  /**
   * Proceed to next step with validation. Special handling when leaving STAR to FINAL:
   * don't advance UI until user confirms generation.
   */
  const handleNext = useCallback(async () => {
    if (isNavigating) return

    // First, flush any unsaved data from ActionStep components
    window.dispatchEvent(new CustomEvent('flushUnsavedData'))
    
    // Give a brief moment for the flush to complete
    await new Promise(resolve => setTimeout(resolve, 10))

    const nextStep = Math.min(currentStep + 1, totalSteps)

    // Intro (1) and STAR Intro (5) have no validations
    if (currentStep === 1 || currentStep === 5) {
      setCurrentStep(nextStep)
      return
    }

    setIsNavigating(true)
    try {
      const isValid = await validateStep(currentStep, starCount, methods)
      if (!isValid) return

      // Boundary: last STAR step -> show confirm instead of advancing
      const lastStarStep = 5 + starCount * 4
      if (currentStep === lastStarStep) {
        const formData = methods.getValues()
        pendingFormDataRef.current = formData

        setIsSavingInBackground(true)
        savePitchData(formData, pitchId, setPitchId, toast, currentStep)
          .catch(() => {
            // Silent; auto-save will retry
          })
          .finally(() => setIsSavingInBackground(false))

        setShowConfirmDialog(true)
        return
      }

      // Normal advance + background save
      setCurrentStep(nextStep)
      const formData = methods.getValues()
      setIsSavingInBackground(true)
      savePitchData(formData, pitchId, setPitchId, toast, nextStep)
        .catch((error) => {
          console.error("Background save failed:", error)
          toast({
            title: "Save Warning",
            description: "Your progress will be saved automatically. You can continue working.",
            variant: "default"
          })
        })
        .finally(() => setIsSavingInBackground(false))
    } catch (error) {
      console.error("Unexpected error in handleNext:", error)
      toast({
        title: "Validation Error",
        description: "Please check your inputs and try again.",
        variant: "destructive"
      })
    } finally {
      setIsNavigating(false)
    }
  }, [currentStep, starCount, totalSteps, methods, pitchId, setPitchId, toast, isNavigating])

  /** Navigate back one step; blocked after generation confirmation */
  const handleBack = useCallback(() => {
    if (isNavigating) return
    if (isPitchGenerationConfirmed) {
      toast({
        title: "Navigation locked",
        description: "You can't go back after pitch generation has started.",
        variant: "destructive"
      })
      return
    }
    setCurrentStep((s) => Math.max(s - 1, 1))
  }, [isPitchGenerationConfirmed, toast, isNavigating])

  /**
   * Save & Close from non-final steps.
   * Saves if dirty, otherwise just clears cache and navigates.
   */
  const handleSaveAndClose = useCallback(async () => {
    // First, flush any unsaved data from ActionStep components
    window.dispatchEvent(new CustomEvent('flushUnsavedData'))
    
    // Give a brief moment for the flush to complete
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const { isDirty } = methods.formState
    if (!isDirty) {
      clearCachedPitchId()
      router.push("/dashboard")
      return
    }
    const data = methods.getValues()
    try {
      await savePitchData(data, pitchId, setPitchId, toast, currentStep)
      clearCachedPitchId()
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to save before navigating:", error)
      toast({
        title: "Save Error",
        description: "We couldn't save your pitch. Please try again.",
        variant: "destructive"
      })
    }
  }, [methods, pitchId, currentStep, toast, router])

  /**
   * Final Save and Close on the review step.
   * - If there was a generation error: save as draft and navigate to dashboard.
   * - Otherwise: finalize the pitch. NEW: show feedback dialog instead of redirecting.
   */
  const handleSubmitFinal = useCallback(async () => {
    // First, flush any unsaved data from ActionStep components
    window.dispatchEvent(new CustomEvent('flushUnsavedData'))
    
    // Give a brief moment for the flush to complete
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const data = methods.getValues()

    // Branch: treat as draft save if final generation failed
    if (finalPitchError) {
      data.agentExecutionId = ""
      const lastStarStep = 5 + starCount * 4
      try {
        await savePitchData(data, pitchId, setPitchId, toast, lastStarStep)
        clearCachedPitchId()
        router.push("/dashboard")
      } catch (error) {
        console.error("Failed to save draft after generation error:", error)
        toast({
          title: "Save Error",
          description: "We couldn’t save your pitch. Please try again.",
          variant: "destructive"
        })
      }
      return
    }

    // Success path: finalize pitch but OPEN FEEDBACK instead of redirecting.
    // We shim router.push so submitFinalPitch does not navigate away.
    const interceptingRouter = {
      ...router,
      push: (_: string) => {
        setShowFeedbackDialog(true)
      }
    } as any

    await submitFinalPitch(data, pitchId, setPitchId, toast, interceptingRouter)
  }, [
    methods,
    pitchId,
    setPitchId,
    toast,
    router,
    finalPitchError,
    starCount,
    clearCachedPitchId
  ])

  /** Called by UI once AI has loaded content successfully */
  const handlePitchLoaded = useCallback(() => {
    setIsPitchLoading(false)
    setFinalPitchError(null)
  }, [])

  /** UI helper to restart generation flow from the end of STAR */
  const retryPitchGeneration = () => {
    const lastStarStep = 5 + starCount * 4
    setCurrentStep(lastStarStep)
    pendingFormDataRef.current = methods.getValues()
    setTimeout(() => setShowConfirmDialog(true), 0)
  }

  // Broadcasted "saveAndExit" support for top-level nav buttons
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

    // Pitch identity
    pitchId,
    setPitchId,

    // Loading and status
    isPitchLoading,
    finalPitchError,
    isNavigating,
    isSavingInBackground,

    // Generation confirmation
    showConfirmDialog,
    setShowConfirmDialog,
    handleConfirmPitchGeneration,
    handleCancelPitchGeneration,

    // Generation state
    isPitchGenerationConfirmed,

    // NEW (Step 5): Feedback dialog control
    showFeedbackDialog,
    setShowFeedbackDialog,

    // Actions
    handleNext,
    handleBack,
    handleSaveAndClose,
    handleSubmitFinal,
    handleSectionNavigate,
    handlePitchLoaded,

    // Retry generation
    retryPitchGeneration
  }
}