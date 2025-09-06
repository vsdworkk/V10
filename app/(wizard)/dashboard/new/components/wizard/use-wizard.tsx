"use client"
/**
 * Main hook for the Pitch Wizard. Manages steps, persistence, and generation flow.
 * Final-step fix: guard handleSubmitFinal until pitch is displayed in UI.
 */
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

  // Wizard state
  const [currentStep, setCurrentStep] = useState(() => {
    if (initialStep && Number.isInteger(initialStep) && initialStep > 0)
      return initialStep
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const stepParam = urlParams.get("step")
      if (stepParam) {
        const stepFromUrl = parseInt(stepParam, 10)
        if (!isNaN(stepFromUrl) && stepFromUrl > 0) return stepFromUrl
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

  // Generation confirmation and state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const pendingFormDataRef = useRef<PitchWizardFormData | null>(null)
  const [isPitchGenerationConfirmed, setIsPitchGenerationConfirmed] =
    useState(false)

  // Feedback dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  // React Hook Form
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: mapExistingDataToDefaults(userId, pitchData),
    mode: "onChange",
    delayError: 0
  })

  // Step math
  const starCount = parseInt(methods.watch("starExamplesCount") || "2", 10)
  const totalSteps = 4 + 1 + starCount * 4 + 1 // Intro + Role + Exp + Guidance + STAR Intro + 4*STAR + Final
  const { section: currentSection, header: currentHeader } =
    computeSectionAndHeader(currentStep, starCount)
  const prevStepRef = useRef(1)

  // Persist ongoing pitch id
  useEffect(() => {
    if (pitchId) sessionStorage.setItem("ongoingPitchId", pitchId)
    else sessionStorage.removeItem("ongoingPitchId")
  }, [pitchId])

  // Lock form after generation confirm
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
            link.setAttribute(
              "title",
              "Navigation locked: Pitch generation has started"
            )
          }
        }
      })
    }
  }, [isPitchGenerationConfirmed, isPitchLoading])

  // Emit section changes
  useEffect(() => {
    const { section } = computeSectionAndHeader(currentStep, starCount)
    const isForwardNavigation = currentStep > prevStepRef.current
    const event = new CustomEvent("sectionChange", {
      detail: { section, isForwardNavigation }
    })
    window.dispatchEvent(event)
    prevStepRef.current = currentStep
  }, [currentStep, starCount])

  // Listen for external section navigation
  useEffect(() => {
    const handleSectionNavigate = (e: any) => {
      if (e.detail && e.detail.section) {
        const targetSection = e.detail.section as Section
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
  }, [starCount, isPitchGenerationConfirmed, toast, methods, pitchId])

  // Debounced background save on step change
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
      ).finally(() => setIsSavingInBackground(false))
    }, 1000)
    return () => clearTimeout(timeout)
  }, [currentStep, pitchId, methods, toast])

  // Keep ?step in sync
  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    const currentStepParam = currentUrl.searchParams.get("step")
    if (parseInt(currentStepParam || "1") !== currentStep) {
      currentUrl.searchParams.set("step", currentStep.toString())
      window.history.replaceState({}, "", currentUrl.toString())
    }
  }, [currentStep])

  // Utils
  const clearCachedPitchId = () => {
    sessionStorage.removeItem("ongoingPitchId")
    setPitchId(undefined)
  }

  // Actions
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
        savePitchData(
          methods.getValues(),
          pitchId,
          setPitchId,
          toast,
          targetStep
        )
          .catch(() => {
            toast({
              title: "Save Warning",
              description: "Your progress will be saved automatically.",
              variant: "default"
            })
          })
          .finally(() => setIsSavingInBackground(false))
      }
    },
    [
      currentStep,
      starCount,
      isPitchGenerationConfirmed,
      toast,
      methods,
      pitchId
    ]
  )

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
        // handled in triggerFinalPitch
      }
      pendingFormDataRef.current = null
    }
  }, [currentStep, methods, pitchId, starCount, toast])

  const handleCancelPitchGeneration = useCallback(() => {
    setShowConfirmDialog(false)
    pendingFormDataRef.current = null
  }, [])

  const handleNext = useCallback(async () => {
    if (isNavigating) return
    window.dispatchEvent(new CustomEvent("flushUnsavedData"))
    await new Promise(resolve => setTimeout(resolve, 10))
    const nextStep = Math.min(currentStep + 1, totalSteps)

    if (currentStep === 1 || currentStep === 5) {
      setCurrentStep(nextStep)
      return
    }

    setIsNavigating(true)
    try {
      const isValid = await validateStep(currentStep, starCount, methods)
      if (!isValid) return

      const lastStarStep = 5 + starCount * 4
      if (currentStep === lastStarStep) {
        const formData = methods.getValues()
        pendingFormDataRef.current = formData
        setIsSavingInBackground(true)
        savePitchData(formData, pitchId, setPitchId, toast, currentStep)
          .catch(() => {})
          .finally(() => setIsSavingInBackground(false))
        setShowConfirmDialog(true)
        return
      }

      setCurrentStep(nextStep)
      const formData = methods.getValues()
      setIsSavingInBackground(true)
      savePitchData(formData, pitchId, setPitchId, toast, nextStep)
        .catch(() => {
          toast({
            title: "Save Warning",
            description:
              "Your progress will be saved automatically. You can continue working.",
            variant: "default"
          })
        })
        .finally(() => setIsSavingInBackground(false))
    } catch {
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
    setCurrentStep(s => Math.max(s - 1, 1))
  }, [isPitchGenerationConfirmed, toast, isNavigating])

  const handleSaveAndClose = useCallback(async () => {
    window.dispatchEvent(new CustomEvent("flushUnsavedData"))
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
    } catch {
      toast({
        title: "Save Error",
        description: "We couldn't save your pitch. Please try again.",
        variant: "destructive"
      })
    }
  }, [methods, pitchId, currentStep, toast, router])

  const handleSubmitFinal = useCallback(async () => {
    window.dispatchEvent(new CustomEvent("flushUnsavedData"))
    await new Promise(resolve => setTimeout(resolve, 10))
    const data = methods.getValues()

    // Guard: do not finalize until the pitch has been displayed in UI.
    // Allow the error branch to proceed to save as draft.
    const content = (data.pitchContent || "").trim()
    if (!finalPitchError && (isPitchLoading || !content)) {
      toast({
        title: "Pitch not ready",
        description: isPitchLoading
          ? "Wait until the pitch appears before saving."
          : "Pitch must be displayed before saving.",
        variant: "destructive"
      })
      return
    }

    // Generation error → save as draft and exit
    if (finalPitchError) {
      data.agentExecutionId = ""
      const lastStarStep = 5 + starCount * 4
      try {
        await savePitchData(data, pitchId, setPitchId, toast, lastStarStep)
        clearCachedPitchId()
        router.push("/dashboard")
      } catch {
        toast({
          title: "Save Error",
          description: "We couldn’t save your pitch. Please try again.",
          variant: "destructive"
        })
      }
      return
    }

    // Success path: finalize and open feedback dialog (intercept router.push)
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
    isPitchLoading,
    clearCachedPitchId
  ])

  const handlePitchLoaded = useCallback(() => {
    setIsPitchLoading(false)
    setFinalPitchError(null)
  }, [])

  const retryPitchGeneration = () => {
    const lastStarStep = 5 + starCount * 4
    setCurrentStep(lastStarStep)
    pendingFormDataRef.current = methods.getValues()
    setTimeout(() => setShowConfirmDialog(true), 0)
  }

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
    methods,
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

    // Feedback dialog control
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
