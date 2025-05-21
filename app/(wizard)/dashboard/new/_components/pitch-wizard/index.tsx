"use client"

import { FormProvider } from "react-hook-form"
import { motion } from "framer-motion"
import { Save, ArrowRight, ArrowLeft } from "lucide-react"
import type { SelectPitch } from "@/db/schema/pitches-schema"

// Components
import WizardHeader from "../wizard-header"
import WizardIntroStep from "../wizard-intro-step"
import RoleStep from "../role-step"
import ExperienceStep from "../experience-step"
import GuidanceStep from "../guidance-step"
import SituationStep from "../situation-step"
import TaskStep from "../task-step"
import ActionStep from "../action-step"
import ResultStep from "../result-step"
import ReviewStep from "../review-step"
import PitchConfirmationDialog from "../pitch-confirmation-dialog"
import { Button } from "@/components/ui/button"

// Custom hook
import { useWizard } from "./use-wizard"

interface PitchWizardProps {
  userId: string
  pitchData?: SelectPitch
}

export default function PitchWizard({ userId, pitchData }: PitchWizardProps) {
  const {
    methods,
    currentStep,
    totalSteps,
    currentSection,
    currentHeader,
    starCount,
    pitchId,
    isPitchLoading,
    finalPitchError,
    showConfirmDialog,
    setShowConfirmDialog,
    handleConfirmPitchGeneration,
    handleCancelPitchGeneration,
    isPitchGenerationConfirmed,
    handleNext,
    handleBack,
    handleSaveAndClose,
    handleSubmitFinal,
    handlePitchLoaded
  } = useWizard({ userId, pitchData })

  // Render the appropriate step component based on current step
  function renderStep() {
    // Step 1 => Intro
    if (currentStep === 1) return <WizardIntroStep />
    // Step 2 => Role
    if (currentStep === 2) return <RoleStep />
    // Step 3 => Experience
    if (currentStep === 3) return <ExperienceStep />
    // Step 4 => Guidance
    if (currentStep === 4) return <GuidanceStep pitchId={pitchId} />

    // Next: starExamples sub-steps
    const firstStarStep = 5
    const lastStarStep = 4 + starCount * 4
    if (currentStep >= firstStarStep && currentStep <= lastStarStep) {
      const stepInStar = currentStep - firstStarStep
      const exampleIndex = Math.floor(stepInStar / 4)
      const subStepIndex = stepInStar % 4

      if (subStepIndex === 0)
        return <SituationStep exampleIndex={exampleIndex} />
      if (subStepIndex === 1) return <TaskStep exampleIndex={exampleIndex} />
      if (subStepIndex === 2) return <ActionStep exampleIndex={exampleIndex} />
      if (subStepIndex === 3) return <ResultStep exampleIndex={exampleIndex} />
    }

    // Final step: review
    return (
      <ReviewStep
        isPitchLoading={isPitchLoading}
        onPitchLoaded={handlePitchLoaded}
        errorMessage={finalPitchError}
      />
    )
  }

  // Return the entire form + wizard controls
  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        {/* Add global styles for form fields */}
        <style jsx global>{`
          .space-y-8 input,
          .space-y-8 textarea,
          .space-y-8 select {
            border-color: #f0f0f5 !important;
            border-width: 1px !important;
            border-radius: 0.5rem !important;
            transition: all 0.2s ease-in-out;
          }

          .space-y-8 input:focus,
          .space-y-8 textarea:focus,
          .space-y-8 select:focus {
            border-color: #e0e0ef !important;
            box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.08) !important;
          }
        `}</style>

        {/* Confirmation Dialog */}
        <PitchConfirmationDialog
          isOpen={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleConfirmPitchGeneration}
          onCancel={handleCancelPitchGeneration}
        />

        {/* Header section */}
        <div className="mb-6">
          <WizardHeader
            header={currentHeader}
            isIntro={currentSection === "INTRO"}
          />
        </div>

        {/* Card containing form fields */}
        <div
          className="mb-8 overflow-hidden rounded-2xl bg-white"
          style={{
            boxShadow:
              "0 12px 28px -12px rgba(0, 0, 0, 0.07), 0 5px 12px -6px rgba(0, 0, 0, 0.035)"
          }}
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-10 flex items-center justify-between pt-10">
          {/* Back button - only show when not on the review step */}
          {currentStep > 1 && currentStep < totalSteps ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isPitchGenerationConfirmed}
              className={`group flex items-center px-6 py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800 ${
                isPitchGenerationConfirmed
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-4">
            {/* Save and Close - Only show when NOT on the final review step */}
            {currentStep < totalSteps && (
              <Button
                variant="outline"
                onClick={handleSaveAndClose}
                className="group flex items-center px-6 py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800"
              >
                <Save className="mr-2 size-4 group-hover:scale-110" />
                Save &amp; Close
              </Button>
            )}

            {/* Next or Final Submit */}
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                className="group flex items-center rounded-xl bg-blue-500 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow"
              >
                Next Step
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmitFinal}
                className="ml-auto bg-green-600 px-6 py-3 font-medium hover:bg-green-700"
              >
                Submit Pitch
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
