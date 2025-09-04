/**
 * @file app/(wizard)/dashboard/new/components/wizard/index.tsx
 * Wizard UI shell. Renders steps, navigation, and Save/Close controls.
 * Change: make Save & Close enabled on steps > Role Details whenever a pitch exists.
 */
"use client"

import { FormProvider } from "react-hook-form"
import { motion } from "framer-motion"
import { Save, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { SelectPitch } from "@/db/schema/pitches-schema"

// Components
import WizardHeader from "../progress/wizard-header"
import WizardIntroStep from "../steps/wizard-intro-step"
import RoleStep from "../steps/role-step"
import ExperienceStep from "../steps/experience-step"
import GuidanceStep from "../steps/guidance-step"
import StarExamplesIntroStep from "../steps/star-examples-intro-step"
import SituationStep from "../steps/situation-step"
import TaskStep from "../steps/task-step"
import ActionStep from "../steps/action-step"
import ResultStep from "../steps/result-step"
import ReviewStep from "../steps/review-step"
import PitchConfirmationDialog from "../dialogs/pitch-confirmation-dialog"
import FeedbackDialog from "./dialogs/feedback-dialog"
import { Button } from "@/components/ui/button"

// Hook
import { useWizard } from "./use-wizard"

interface PitchWizardProps {
  userId: string
  pitchData?: SelectPitch
  initialStep?: number
}

export default function PitchWizard({ userId, pitchData, initialStep }: PitchWizardProps) {
  const router = useRouter()
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
    isNavigating,
    handleNext,
    handleBack,
    handleSaveAndClose,
    handleSubmitFinal,
    handlePitchLoaded,
    retryPitchGeneration,
    // Feedback dialog control
    showFeedbackDialog,
    setShowFeedbackDialog
  } = useWizard({ userId, pitchData, initialStep })

  function renderStep() {
    if (currentStep === 1) return <WizardIntroStep />
    if (currentStep === 2) return <RoleStep />
    if (currentStep === 3) return <ExperienceStep />
    if (currentStep === 4) return <GuidanceStep pitchId={pitchId} />
    if (currentStep === 5) return <StarExamplesIntroStep />

    const firstActualStarStep = 6
    const lastStarStep = 5 + starCount * 4
    if (currentStep >= firstActualStarStep && currentStep <= lastStarStep) {
      const stepInStar = currentStep - firstActualStarStep
      const exampleIndex = Math.floor(stepInStar / 4)
      const subStepIndex = stepInStar % 4
      if (subStepIndex === 0) return <SituationStep exampleIndex={exampleIndex} />
      if (subStepIndex === 1) return <TaskStep exampleIndex={exampleIndex} />
      if (subStepIndex === 2) return <ActionStep exampleIndex={exampleIndex} />
      if (subStepIndex === 3) return <ResultStep exampleIndex={exampleIndex} />
    }
    return (
      <ReviewStep
        isPitchLoading={isPitchLoading}
        onPitchLoaded={handlePitchLoaded}
        errorMessage={finalPitchError}
        onRetry={retryPitchGeneration}
      />
    )
  }

  // New: precise enablement for Save & Close (bug fix).
  // Step 2 (Role Details): only if dirty. Steps >2: enable if pitch exists or dirty. Step 1 stays disabled.
  const isDirty = methods.formState.isDirty
  const canSaveAndClose =
    currentStep === 2 ? isDirty : currentStep > 2 ? !!pitchId || isDirty : isDirty

  return (
    <FormProvider {...methods}>
      <div className="relative flex h-full flex-col">
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

        {/* Confirmation dialog */}
        <PitchConfirmationDialog
          isOpen={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleConfirmPitchGeneration}
          onCancel={handleCancelPitchGeneration}
        />

        {/* Feedback dialog (Step 6). Only render if we have a pitchId */}
        {pitchId ? (
          <FeedbackDialog
            pitchId={pitchId}
            open={showFeedbackDialog}
            onOpenChange={(v) => {
              setShowFeedbackDialog(v)
              if (!v) router.push("/dashboard")
            }}
          />
        ) : null}

        {/* Desktop header */}
        <div className="mb-6 hidden shrink-0 lg:block">
          <WizardHeader header={currentHeader} isIntro={currentSection === "INTRO"} />
        </div>

        {/* Mobile header */}
        <div className="mb-4 shrink-0 lg:hidden">
          <div className="px-2">
            <h1 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl">
              {currentHeader}
            </h1>
            {currentSection !== "INTRO" && (
              <p className="mt-1 text-sm text-gray-600">Complete the fields below to continue</p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="min-h-0 flex-1 lg:mb-6">
          {/* Desktop */}
          <div className="hidden h-full overflow-hidden lg:block">
            <div className="h-full overflow-y-auto">
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
          </div>

          {/* Mobile */}
          <div className="h-full lg:hidden">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderStep()}
            </motion.div>
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden shrink-0 items-center justify-between border-t border-gray-100 bg-white pt-4 lg:flex">
          {/* Back */}
          {currentStep > 1 && currentStep < totalSteps ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isNavigating || isPitchGenerationConfirmed}
              className={`group flex items-center px-6 py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800 ${
                isPitchGenerationConfirmed ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-4">
            {/* Save & Close (bug fix: conditional enablement) */}
            {currentStep < totalSteps && (
              <Button
                variant="outline"
                onClick={handleSaveAndClose}
                disabled={!canSaveAndClose}
                className="group flex items-center px-6 py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800"
                title={
                  !canSaveAndClose && currentStep === 2
                    ? "Make a change to enable Save & Close"
                    : undefined
                }
              >
                <Save className="mr-2 size-4 group-hover:scale-110" />
                Save & Close
              </Button>
            )}

            {/* Next or Final Submit */}
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={isNavigating}
                className="group flex w-[108px] items-center justify-center rounded-xl px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:shadow hover:brightness-110"
                style={{ backgroundColor: "#444ec1" }}
              >
                {isNavigating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    {currentStep === 1 ? "Begin" : "Next"}
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitFinal}
                className="group flex items-center px-6 py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800"
              >
                <Save className="mr-2 size-4 group-hover:scale-110" />
                Save and Close
              </Button>
            )}
          </div>
        </div>

        {/* Mobile navigation - fixed at bottom */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            {currentStep > 1 && currentStep < totalSteps ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isNavigating || isPitchGenerationConfirmed}
                className={`group flex flex-1 items-center justify-center py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800 ${
                  isPitchGenerationConfirmed ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1" />
                Back
              </Button>
            ) : null}

            {currentStep < totalSteps && (
              <Button
                variant="outline"
                onClick={handleSaveAndClose}
                disabled={!canSaveAndClose}
                className="group flex flex-1 items-center justify-center py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800"
                title={
                  !canSaveAndClose && currentStep === 2
                    ? "Make a change to enable Save & Close"
                    : undefined
                }
              >
                <Save className="mr-2 size-4 group-hover:scale-110" />
                Save & Close
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={isNavigating}
                className="group flex flex-1 items-center justify-center rounded-xl py-3 font-medium text-white shadow-sm transition-all duration-200 hover:shadow hover:brightness-110"
                style={{ backgroundColor: "#444ec1" }}
              >
                {isNavigating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    {currentStep === 1 ? "Begin" : "Next"}
                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitFinal}
                className="group flex flex-1 items-center justify-center py-3 font-normal text-gray-600 transition-all duration-200 hover:text-gray-800"
              >
                <Save className="mr-2 size-4 group-hover:scale-110" />
                Save and Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
