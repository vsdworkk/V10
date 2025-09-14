"use client"

// Handles the Action step where users list what they did in each STAR example
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData, actionStepSchema } from "../wizard/schema"
import WordCountIndicator from "../utilities/word-count-indicator"
import { useState, useEffect, useRef, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Check, Lightbulb } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { ActionStep as ActionStepType } from "@/types/action-steps-types"

interface ActionStepProps {
  /**
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function ActionStep
 * Allows multiple steps describing the user's actions.
 * Data is stored in starExamples[exampleIndex].action.steps[]
 */
export default function ActionStep({ exampleIndex }: ActionStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  // Watch the action object for this example
  const storedAction = watch(`starExamples.${exampleIndex}.action`)

  const [steps, setSteps] = useState<ActionStepType[]>([])
  const [openStep, setOpenStep] = useState<string | undefined>(undefined)
  const [tipsOpen, setTipsOpen] = useState<string | undefined>(undefined) // Tips closed by default
  // Track unsaved changes for each step by step ID
  const pendingChangesRef = useRef<Map<string, string>>(new Map())

  const MAX_STEPS = 5
  const hasReachedMaxSteps = steps.length >= MAX_STEPS

  // On mount or when storedAction changes, parse existing steps into our local state
  useEffect(() => {
    // If we already have steps in local state, don't re-initialize
    if (steps.length > 0) return

    if (
      storedAction &&
      typeof storedAction === "object" &&
      "steps" in storedAction &&
      Array.isArray(storedAction.steps)
    ) {
      // Convert stored steps to our local format
      const parsedSteps = storedAction.steps.map(
        (step: any, index: number) => ({
          id: uuidv4(),
          position: index + 1,
          "what-did-you-specifically-do-in-this-step":
            step["what-did-you-specifically-do-in-this-step"] || "",
          isCompleted: Boolean(
            step["what-did-you-specifically-do-in-this-step"]
          ),
          // Set fixed title for display
          title: `Step ${index + 1}`,
          description: ""
        })
      )
      if (parsedSteps.length > 0) {
        setSteps(parsedSteps)
        updateActionValue(parsedSteps)
        return
      }
    }

    // If no existing data, create three default steps
    setSteps([
      {
        id: uuidv4(),
        position: 1,
        "what-did-you-specifically-do-in-this-step": "",
        isCompleted: false,
        title: "Step 1",
        description: ""
      },
      {
        id: uuidv4(),
        position: 2,
        "what-did-you-specifically-do-in-this-step": "",
        isCompleted: false,
        title: "Step 2",
        description: ""
      },
      {
        id: uuidv4(),
        position: 3,
        "what-did-you-specifically-do-in-this-step": "",
        isCompleted: false,
        title: "Step 3",
        description: ""
      }
    ])
  }, [steps.length, storedAction])

  /**
   * Update the form whenever our local steps change
   */
  const updateActionValue = (updatedSteps: ActionStepType[]) => {
    const stepData = updatedSteps
      .filter(s => s["what-did-you-specifically-do-in-this-step"]?.trim())
      .map(step => ({
        stepNumber: step.position,
        "what-did-you-specifically-do-in-this-step":
          step["what-did-you-specifically-do-in-this-step"] || ""
      }))

    // Update the form field starExamples[exampleIndex].action.steps
    setValue(
      `starExamples.${exampleIndex}.action`,
      { steps: stepData },
      { shouldDirty: true }
    )
  }

  /**
   * Flush any unsaved changes to the form data
   * This is called when outer save/navigation operations occur
   */
  const flushUnsavedChanges = useCallback(() => {
    const pendingChanges = pendingChangesRef.current
    if (pendingChanges.size === 0) return

    // Create updated steps with any pending changes
    const updatedSteps = steps.map(step => {
      const pendingValue = pendingChanges.get(step.id)
      if (pendingValue !== undefined) {
        return {
          ...step,
          "what-did-you-specifically-do-in-this-step": pendingValue,
          isCompleted: Boolean(pendingValue.trim()),
          title: `Step ${step.position}`,
          description: ""
        }
      }
      return step
    })

    // Update form data and clear pending changes
    updateActionValue(updatedSteps)
    setSteps(updatedSteps)
    pendingChanges.clear()
  }, [steps, updateActionValue])

  // Listen for flush events from parent wizard
  useEffect(() => {
    const handleFlushEvent = () => {
      flushUnsavedChanges()
    }

    window.addEventListener("flushUnsavedData", handleFlushEvent)
    return () =>
      window.removeEventListener("flushUnsavedData", handleFlushEvent)
  }, [flushUnsavedChanges])

  // Save step changes
  const handleSaveStep = (stepId: string, what: string) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          "what-did-you-specifically-do-in-this-step": what,
          isCompleted: Boolean(what.trim()),
          // Keep title as Step N instead of setting it to the 'what' value
          title: `Step ${step.position}`,
          description: ""
        }
      }
      return step
    })

    setSteps(updatedSteps)
    updateActionValue(updatedSteps)

    // Close the accordion
    setOpenStep(undefined)
  }

  const handleAddStep = () => {
    if (hasReachedMaxSteps) return

    const newStep: ActionStepType = {
      id: uuidv4(),
      position: steps.length + 1,
      "what-did-you-specifically-do-in-this-step": "",
      isCompleted: false,
      title: `Step ${steps.length + 1}`,
      description: ""
    }

    const updatedSteps = [...steps, newStep]
    setSteps(updatedSteps)
    setOpenStep(newStep.id)
  }

  const handleValueChange = (value: string) => {
    if (value === "") {
      setOpenStep(undefined)
      return
    }
    setOpenStep(value)
  }

  return (
    <div className="px-2 py-1 sm:p-6">
      {/* Mobile-optimized scrollable container with proper bottom padding for mobile nav */}
      <div className="flex h-[calc(100vh-200px)] flex-col overflow-y-auto pb-20 sm:h-auto sm:pb-2">
        <div className="mx-auto flex w-full max-w-4xl flex-col space-y-4 sm:space-y-6">
          {/* Action Header - Mobile optimized */}
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Action
          </h2>

          {/* Tips Accordion - Mobile optimized */}
          <Accordion
            type="single"
            collapsible
            value={tipsOpen}
            onValueChange={setTipsOpen}
            className="w-full"
          >
            <AccordionItem
              value="tips-panel"
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl"
            >
              <AccordionTrigger className="px-4 py-3 transition-all hover:no-underline sm:px-6 sm:py-4">
                <div className="flex items-center">
                  <div className="mr-2 flex size-6 items-center justify-center rounded-full border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md sm:mr-3 sm:size-8">
                    <div className="relative">
                      <Lightbulb
                        className="size-3 text-amber-500 drop-shadow-sm sm:size-5"
                        strokeWidth={2.5}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-300/0" />
                    </div>
                  </div>
                  <span className="text-base font-medium text-gray-900 sm:text-lg">
                    Tips
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
                <div className="space-y-3 text-gray-700 sm:space-y-5">
                  <p className="text-sm text-gray-900 sm:text-base">
                    Think about the overarching steps you took to complete the
                    assigned task, for example:
                  </p>
                  <div className="ml-4 space-y-3 sm:ml-6 sm:space-y-4">
                    <p className="text-sm text-gray-700 sm:text-base">
                      <span className="font-bold">Step 1:</span> Consulting
                      stakeholders or researching the issue.
                    </p>
                    <p className="text-sm text-gray-700 sm:text-base">
                      <span className="font-bold">Step 2:</span> Developing
                      solutions or implementing actions.
                    </p>
                    <p className="text-sm text-gray-700 sm:text-base">
                      <span className="font-bold">Step 3:</span> Presenting
                      results or gathering feedback.
                    </p>
                  </div>
                  <p className="text-sm text-gray-900 sm:text-base">
                    Don't worry about formal or perfect wording, instead focus
                    on clearly explaining what you did and how you did it in
                    each step.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Section - Mobile optimized */}
          <div className="w-full">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
              <div className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center">
                  <div
                    className="mr-2 flex size-6 items-center justify-center rounded-full shadow-md sm:mr-3 sm:size-8"
                    style={{
                      background:
                        "linear-gradient(to bottom right, #eef2ff, #ddd6fe)",
                      borderColor: "#c7d2fe",
                      borderWidth: "1px"
                    }}
                  >
                    <div className="relative">
                      <Check
                        className="size-3 drop-shadow-sm sm:size-5"
                        style={{
                          color: "#444ec1",
                          filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))"
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "linear-gradient(to top right, rgba(68, 78, 193, 0.3), rgba(68, 78, 193, 0))"
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-base font-medium text-gray-900 sm:text-lg">
                    Your Steps
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  <Accordion
                    type="single"
                    collapsible
                    value={openStep}
                    onValueChange={handleValueChange}
                    className="space-y-2 sm:space-y-3"
                  >
                    {steps.map(step => (
                      <StepItem
                        key={step.id}
                        step={step}
                        onSave={handleSaveStep}
                        exampleIndex={exampleIndex}
                        pendingChangesRef={pendingChangesRef}
                      />
                    ))}
                  </Accordion>

                  {/* Add Step Button - Mobile optimized */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    disabled={hasReachedMaxSteps}
                    className="group mt-3 flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-3 text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-700 active:scale-95 sm:mt-4 sm:rounded-2xl sm:py-4"
                  >
                    <Plus className="mr-2 size-4 transition-transform group-hover:scale-110" />
                    <span className="text-sm sm:text-base">
                      Add Step {steps.length + 1}
                    </span>
                  </Button>
                  {hasReachedMaxSteps && (
                    <p className="text-center text-xs text-gray-500">
                      You've reached the maximum number of steps ({MAX_STEPS}).
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepItemProps {
  step: ActionStepType
  onSave: (stepId: string, what: string) => void
  exampleIndex: number
  pendingChangesRef: React.MutableRefObject<Map<string, string>>
}

/**
 * Renders a single collapsible step item.
 */
function StepItem({
  step,
  onSave,
  exampleIndex,
  pendingChangesRef
}: StepItemProps) {
  const {
    formState: { errors }
  } = useFormContext<PitchWizardFormData>()
  const stepIndex = step.position - 1

  // Helper function to get word count limits from schema
  const getWordLimits = (fieldSchema: any) => {
    try {
      const desc =
        fieldSchema._def?.schema?.description || fieldSchema.description
      if (desc) {
        const data = JSON.parse(desc)
        if (
          typeof data.minWords === "number" &&
          typeof data.maxWords === "number"
        ) {
          return { min: data.minWords, max: data.maxWords }
        }
      }
    } catch (error) {
      // Fallback to default values
    }
    return { min: 20, max: 150 } // Default fallback
  }

  const [what, setWhat] = useState<string>(
    step["what-did-you-specifically-do-in-this-step"] || ""
  )

  // Update pending changes tracker
  const updatePendingChange = (value: string) => {
    if (value !== step["what-did-you-specifically-do-in-this-step"]) {
      pendingChangesRef.current.set(step.id, value)
    } else {
      pendingChangesRef.current.delete(step.id)
    }
  }

  // Sync local state when step changes
  useEffect(() => {
    setWhat(step["what-did-you-specifically-do-in-this-step"] || "")
  }, [step["what-did-you-specifically-do-in-this-step"]])

  // Word count validation
  const wordCount = (what || "").trim().split(/\s+/).filter(Boolean).length
  const limits = getWordLimits(
    actionStepSchema.shape["what-did-you-specifically-do-in-this-step"]
  )
  const isWordCountValid = wordCount >= limits.min && wordCount <= limits.max
  const canSave = Boolean(what?.trim()) && isWordCountValid

  const handleSave = () => {
    if (!canSave) {
      // Trigger word count shake animation for validation feedback
      const fieldNames = [
        `starExamples.${exampleIndex}.action.steps.${stepIndex}.what-did-you-specifically-do-in-this-step`
      ]
      const failedFields = fieldNames.filter(() => !isWordCountValid)
      window.dispatchEvent(
        new CustomEvent("wordCountShake", {
          detail: { fieldNames: failedFields }
        })
      )
      return // Don't save if validation fails
    }

    // Only save if validation passes
    onSave(step.id, what ?? "")
    // Clear pending changes when explicitly saved
    pendingChangesRef.current.delete(step.id)
  }

  return (
    <AccordionItem
      value={step.id}
      className={cn(
        "overflow-hidden rounded-lg border transition-colors duration-200 sm:rounded-xl",
        step.isCompleted
          ? "bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      )}
      style={
        step.isCompleted
          ? {
              borderColor: "#c7d2fe",
              backgroundColor: "#eef2ff"
            }
          : {}
      }
    >
      <AccordionTrigger className="px-4 py-3 transition-all hover:no-underline sm:px-6 sm:py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-medium shadow-sm sm:size-8 sm:text-sm",
                step.isCompleted ? "text-white" : "bg-gray-100 text-gray-600"
              )}
              style={step.isCompleted ? { backgroundColor: "#444ec1" } : {}}
            >
              {step.position}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-medium sm:ml-3 sm:text-lg",
                step.isCompleted ? "text-gray-900" : "text-gray-700"
              )}
            >
              {step.isCompleted
                ? `Step ${step.position}`
                : `Step ${step.position}: Not yet completed`}
            </span>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-2 sm:px-6 sm:pb-5 sm:pt-3">
        <div className="space-y-3 sm:space-y-4">
          {/* WHAT - Mobile optimized */}
          <div className="space-y-2">
            <FormLabel
              htmlFor={`step-${step.id}-what`}
              className="block text-sm font-medium text-gray-700 sm:text-base"
            >
              What did you specifically do in this step?
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-what`}
                value={what}
                onChange={e => {
                  setWhat(e.target.value)
                  updatePendingChange(e.target.value)
                }}
                placeholder="Describe the steps you took to address the situation..."
                className="min-h-20 w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 transition-all duration-300 focus:outline-none sm:min-h-24 sm:p-4 sm:text-base"
                style={
                  {
                    "--focus-ring-color": "#444ec1",
                    "--focus-border-color": "#444ec1"
                  } as React.CSSProperties
                }
                onFocus={e => {
                  e.target.style.borderColor = "#444ec1"
                  e.target.style.boxShadow = "0 0 0 1px rgba(68, 78, 193, 0.1)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#e5e7eb"
                  e.target.style.boxShadow = "none"
                }}
              />
              <WordCountIndicator
                schema={
                  actionStepSchema.shape[
                    "what-did-you-specifically-do-in-this-step"
                  ]
                }
                text={what}
                fieldName={`starExamples.${exampleIndex}.action.steps.${stepIndex}.what-did-you-specifically-do-in-this-step`}
              />
            </div>
          </div>

          {/* Save Button - Mobile optimized */}
          <Button
            type="button"
            className={`mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 active:scale-95 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base ${
              canSave
                ? "cursor-pointer hover:brightness-110"
                : "cursor-not-allowed opacity-50"
            }`}
            style={{ backgroundColor: canSave ? "#444ec1" : "#9ca3af" }}
            onClick={handleSave}
            disabled={!canSave}
            title={
              canSave ? "" : "Please meet word count requirements before saving"
            }
          >
            Save Step {step.position}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
