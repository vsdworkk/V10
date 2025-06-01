// app/(wizard)/dashboard/new/_components/pitch-wizard/index.tsx
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

      if (subStepIndex === 0) return <SituationStep exampleIndex={exampleIndex} />
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
      <div className="h-full flex flex-col relative">
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

        {/* Desktop Header - Only visible on desktop */}
        <div className="hidden lg:block flex-shrink-0 mb-6">
          <WizardHeader header={currentHeader} isIntro={currentSection === "INTRO"} />
        </div>

        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden flex-shrink-0 mb-4">
          <div className="px-2">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
              {currentHeader}
            </h1>
            {currentSection !== "INTRO" && (
              <p className="text-sm text-gray-600 mt-1">
                Complete the fields below to continue
              </p>
            )}
          </div>
        </div>

        {/* Main content area - Scrollable */}
        <div className="flex-1 min-h-0 lg:mb-6">
          {/* Desktop Content Container */}
          <div 
            className="hidden lg:block h-full bg-white rounded-2xl overflow-hidden"
            style={{ 
              boxShadow: '0 12px 28px -12px rgba(0, 0, 0, 0.07), 0 5px 12px -6px rgba(0, 0, 0, 0.035)' 
            }}
          >
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

          {/* Mobile Content Container */}
          <div className="lg:hidden h-full">
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

        {/* Desktop Navigation - Only visible on desktop */}
        <div className="hidden lg:flex flex-shrink-0 justify-between items-center pt-4 border-t border-gray-100 bg-white">
          {/* Back button - only show when not on the review step */}
          {currentStep > 1 && currentStep < totalSteps ? (
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={isPitchGenerationConfirmed}
              className={`px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center group transition-all duration-200 font-normal ${
                isPitchGenerationConfirmed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1" />
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
                className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center group transition-all duration-200 font-normal"
              >
                <Save className="h-4 w-4 mr-2 group-hover:scale-110" />
                Save &amp; Close
              </Button>
            )}

            {/* Next or Final Submit */}
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext} 
                className="px-6 py-3 text-white rounded-xl font-medium flex items-center group transition-all duration-200 shadow-sm hover:shadow hover:brightness-110"
                style={{backgroundColor: '#444ec1'}}
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitFinal}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center group transition-all duration-200 font-normal"
              >
                <Save className="h-4 w-4 mr-2 group-hover:scale-110" />
                Save and Close
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Fixed at bottom, only visible on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="flex items-center justify-between gap-3">
            {/* Back button */}
            {currentStep > 1 && currentStep < totalSteps ? (
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isPitchGenerationConfirmed}
                className={`flex-1 py-3 text-gray-600 hover:text-gray-800 flex items-center justify-center group transition-all duration-200 font-normal ${
                  isPitchGenerationConfirmed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1" />
                Back
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSaveAndClose} 
                className="flex-1 py-3 text-gray-600 hover:text-gray-800 flex items-center justify-center group transition-all duration-200 font-normal"
              >
                <Save className="h-4 w-4 mr-2 group-hover:scale-110" />
                Save &amp; Close
              </Button>
            )}

            {/* Next or Final Submit */}
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext} 
                className="flex-1 py-3 text-white rounded-xl font-medium flex items-center justify-center group transition-all duration-200 shadow-sm hover:shadow hover:brightness-110"
                style={{backgroundColor: '#444ec1'}}
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitFinal}
                className="flex-1 py-3 text-gray-600 hover:text-gray-800 flex items-center justify-center group transition-all duration-200 font-normal"
              >
                <Save className="h-4 w-4 mr-2 group-hover:scale-110" />
                Save and Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}