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
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const pendingFormDataRef = useRef<PitchWizardFormData | null>(null)
  
  // Track if pitch generation has been confirmed
  const [isPitchGenerationConfirmed, setIsPitchGenerationConfirmed] = useState(false)
  
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

  // Disable form fields when pitch generation is confirmed
  useEffect(() => {
    if (isPitchGenerationConfirmed && !isPitchLoading) {
      // Lock the form by setting it to readOnly mode
      const formElement = document.querySelector('form');
      if (formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach((input: Element) => {
          if (input instanceof HTMLElement) {
            input.setAttribute('readonly', 'true');
            input.setAttribute('disabled', 'true');
          }
        });
      }
      
      // Also disable sidebar navigation items (except for the FINAL section)
      const sidebarLinks = document.querySelectorAll('[data-section]');
      sidebarLinks.forEach((link: Element) => {
        if (link instanceof HTMLElement) {
          const section = link.dataset.section;
          if (section && section !== "FINAL") {
            link.classList.add('opacity-50', 'pointer-events-none');
            link.setAttribute('aria-disabled', 'true');
            
            // Add a tooltip explaining why it's disabled
            link.setAttribute('title', 'Navigation locked: Pitch generation has started');
          }
        }
      });
    }
  }, [isPitchGenerationConfirmed, isPitchLoading]);

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
        const targetSection = e.detail.section;
        
        // If pitch generation is confirmed, only allow navigation to FINAL section
        if (isPitchGenerationConfirmed && targetSection !== "FINAL") {
          toast({
            title: "Navigation locked",
            description: "You can't go back after pitch generation has started.",
            variant: "destructive"
          });
          return;
        }
        
        const targetStep = firstStepOfSection(targetSection, starCount);
        setCurrentStep(targetStep);
      }
    }
    
    window.addEventListener("sectionNavigate", handleSectionNavigate)
    return () => window.removeEventListener("sectionNavigate", handleSectionNavigate)
  }, [starCount, isPitchGenerationConfirmed, toast])

  // Handler for navigating to a specific section
  const handleSectionNavigate = useCallback(
    (target: Section) => {
      // If pitch generation is confirmed, only allow navigation to FINAL section
      if (isPitchGenerationConfirmed && target !== "FINAL") {
        toast({
          title: "Navigation locked",
          description: "You can't go back after pitch generation has started.",
          variant: "destructive"
        });
        return;
      }
      
      const targetStep = firstStepOfSection(target, starCount)
      if (targetStep <= currentStep) {
        setCurrentStep(targetStep)
      }
    },
    [currentStep, starCount, isPitchGenerationConfirmed, toast]
  )

  // Handler for proceeding with pitch generation
  const handleConfirmPitchGeneration = useCallback(async () => {
    const lastStarStep = 4 + starCount * 4;
    
    // Only proceed if we've saved form data and we're at the last STAR step
    if (pendingFormDataRef.current && currentStep === lastStarStep) {
      // Close the confirmation dialog
      setShowConfirmDialog(false);
      
      // Navigate to the review step
      setCurrentStep(lastStarStep + 1);
      setIsPitchLoading(true);
      setFinalPitchError(null);
      
      // Mark pitch generation as confirmed
      setIsPitchGenerationConfirmed(true);
      
      try {
        await triggerFinalPitch(
          pendingFormDataRef.current,
          pitchId,
          methods,
          setPitchId,
          toast,
          setIsPitchLoading,
          setFinalPitchError,
          currentStep
        );
      } catch (err) {
        // Error handling is done in the triggerFinalPitch function
        // Even if there's an error, we keep isPitchGenerationConfirmed true
        // to prevent going back and changing inputs
      }
      
      // Clear the pending form data
      pendingFormDataRef.current = null;
    }
  }, [currentStep, methods, pitchId, starCount, toast]);
  
  // Handler for cancelling pitch generation
  const handleCancelPitchGeneration = useCallback(() => {
    setShowConfirmDialog(false);
    pendingFormDataRef.current = null;
  }, []);

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
      // Store the form data for later use
      pendingFormDataRef.current = formData;
      
      // Show the confirmation dialog
      setShowConfirmDialog(true);
      return;
    }

    // Proceed to next step
    setCurrentStep((s) => Math.min(s + 1, totalSteps))
  }, [currentStep, starCount, totalSteps, methods, pitchId, toast])

  // Handler for "Back" button
  const handleBack = useCallback(() => {
    // If pitch generation is confirmed, prevent going back
    if (isPitchGenerationConfirmed) {
      toast({
        title: "Navigation locked",
        description: "You can't go back after pitch generation has started.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep((s) => Math.max(s - 1, 1))
  }, [isPitchGenerationConfirmed, toast])

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
    // Pitch ID state
    pitchId,
    setPitchId,
    // Loading states
    isPitchLoading,
    finalPitchError,
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
    handlePitchLoaded
  }
}