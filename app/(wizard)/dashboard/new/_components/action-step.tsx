"use client"

// Handles the Action step where users list what they did in each STAR example
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target
} from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { ActionStep as ActionStepType } from "@/types/action-steps-types"

// Add word count helper
function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

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
  const [tipsOpen, setTipsOpen] = useState<string | undefined>("tips-panel")

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
          "what-was-the-outcome-of-this-step-optional":
            step["what-was-the-outcome-of-this-step-optional"] || "",
          isCompleted: Boolean(
            step["what-did-you-specifically-do-in-this-step"]
          ),
          // Set fixed title for display
          title: `Step ${index + 1}`,
          description: step["what-was-the-outcome-of-this-step-optional"]
            ? `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}`
            : ""
        })
      )
      if (parsedSteps.length > 0) {
        setSteps(parsedSteps)
        return
      }
    }

    // If no existing data, create three default steps
    setSteps([
      {
        id: uuidv4(),
        position: 1,
        "what-did-you-specifically-do-in-this-step": "",
        "what-was-the-outcome-of-this-step-optional": "",
        isCompleted: false,
        title: "Step 1",
        description: ""
      },
      {
        id: uuidv4(),
        position: 2,
        "what-did-you-specifically-do-in-this-step": "",
        "what-was-the-outcome-of-this-step-optional": "",
        isCompleted: false,
        title: "Step 2",
        description: ""
      },
      {
        id: uuidv4(),
        position: 3,
        "what-did-you-specifically-do-in-this-step": "",
        "what-was-the-outcome-of-this-step-optional": "",
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
          step["what-did-you-specifically-do-in-this-step"] || "",
        "what-was-the-outcome-of-this-step-optional":
          step["what-was-the-outcome-of-this-step-optional"] || ""
      }))

    // Update the form field starExamples[exampleIndex].action.steps
    setValue(
      `starExamples.${exampleIndex}.action`,
      { steps: stepData },
      { shouldDirty: true }
    )
  }

  // Save step changes
  const handleSaveStep = (stepId: string, what: string, outcome: string) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          "what-did-you-specifically-do-in-this-step": what,
          "what-was-the-outcome-of-this-step-optional": outcome,
          isCompleted: Boolean(what.trim()),
          // Keep title as Step N instead of setting it to the 'what' value
          title: `Step ${step.position}`,
          description: outcome ? `Outcome: ${outcome}` : ""
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
      "what-was-the-outcome-of-this-step-optional": "",
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
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-6">
      {/* Tips Accordion */}
      <Accordion
        type="single"
        collapsible
        value={tipsOpen}
        onValueChange={setTipsOpen}
        className="w-full"
      >
        <AccordionItem
          value="tips-panel"
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 transition-all hover:no-underline">
            <div className="flex items-center">
              <div className="mr-3 flex size-8 items-center justify-center rounded-full border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md">
                <div className="relative">
                  <Lightbulb
                    className="size-5 text-amber-500 drop-shadow-sm"
                    strokeWidth={2.5}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-300/0" />
                </div>
              </div>
              <span className="text-lg font-medium text-gray-900">Tips</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-5 text-gray-700">
              <p className="text-base text-gray-900">
                Think about the overarching steps you took to complete the
                assigned task, for example:
              </p>
              <div className="ml-6 space-y-4">
                <p className="text-base text-gray-700">
                  <span className="font-bold">Step 1:</span> Consulting
                  stakeholders or researching the issue.
                </p>
                <p className="text-base text-gray-700">
                  <span className="font-bold">Step 2:</span> Developing
                  solutions or implementing actions.
                </p>
                <p className="text-base text-gray-700">
                  <span className="font-bold">Step 3:</span> Presenting results
                  or gathering feedback.
                </p>
              </div>
              <p className="text-base text-gray-900">
                Don't worry about formal or perfect wording, instead focus on
                clearly explaining what you did and how you did it in each step.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Section */}
      <div className="w-full">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div
                className="mr-3 flex size-8 items-center justify-center rounded-full shadow-md"
                style={{
                  background:
                    "linear-gradient(to bottom right, #eef2ff, #ddd6fe)",
                  borderColor: "#c7d2fe",
                  borderWidth: "1px"
                }}
              >
                <div className="relative">
                  <Check
                    className="size-5 drop-shadow-sm"
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
              <span className="text-lg font-medium text-gray-900">Action</span>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="space-y-4">
              <Accordion
                type="single"
                collapsible
                value={openStep}
                onValueChange={handleValueChange}
                className="space-y-3"
              >
                {steps.map(step => (
                  <StepItem
                    key={step.id}
                    step={step}
                    onSave={handleSaveStep}
                    exampleIndex={exampleIndex}
                  />
                ))}
              </Accordion>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStep}
                disabled={hasReachedMaxSteps}
                className="group mt-4 flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-4 text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-700"
              >
                <Plus className="mr-2 size-4 transition-transform group-hover:scale-110" />
                Add Step {steps.length + 1}
              </Button>
              {hasReachedMaxSteps && (
                <p className="text-xs text-gray-500">
                  You've reached the maximum number of steps ({MAX_STEPS}).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepItemProps {
  step: ActionStepType
  onSave: (stepId: string, what: string, outcome: string) => void
  exampleIndex: number
}

/**
 * Renders a single collapsible step item.
 */
function StepItem({ step, onSave, exampleIndex }: StepItemProps) {
  const {
    formState: { errors }
  } = useFormContext<PitchWizardFormData>()
  const stepIndex = step.position - 1
  const whatError = (
    errors.starExamples?.[exampleIndex]?.action?.steps as any
  )?.[stepIndex]?.["what-did-you-specifically-do-in-this-step"]
  const outcomeError = (
    errors.starExamples?.[exampleIndex]?.action?.steps as any
  )?.[stepIndex]?.["what-was-the-outcome-of-this-step-optional"]
  const [what, setWhat] = useState(
    step["what-did-you-specifically-do-in-this-step"]
  )
  const [outcome, setOutcome] = useState(
    step["what-was-the-outcome-of-this-step-optional"]
  )

  // Word counts
  const whatWords = countWords(what || "")
  const outcomeWords = countWords(outcome || "")

  useEffect(() => {
    setWhat(step["what-did-you-specifically-do-in-this-step"])
    setOutcome(step["what-was-the-outcome-of-this-step-optional"])
  }, [step])

  const handleSave = () => {
    onSave(step.id, what ?? "", outcome ?? "")
  }

  return (
    <AccordionItem
      value={step.id}
      className={cn(
        "overflow-hidden rounded-xl border transition-colors duration-200",
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
      <AccordionTrigger className="px-6 py-4 transition-all hover:no-underline">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-medium shadow-sm",
                step.isCompleted ? "text-white" : "bg-gray-100 text-gray-600"
              )}
              style={step.isCompleted ? { backgroundColor: "#444ec1" } : {}}
            >
              {step.position}
            </div>
            <span
              className={cn(
                "ml-3 text-lg font-medium",
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

      <AccordionContent className="px-6 pb-5 pt-3">
        <div className="space-y-4">
          {/* WHAT */}
          <div className="space-y-2">
            <FormLabel
              htmlFor={`step-${step.id}-what`}
              className="block font-medium text-gray-700"
            >
              What did you specifically do in this step?
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-what`}
                value={what}
                onChange={e => setWhat(e.target.value)}
                placeholder="Describe the steps you took to address the situation..."
                className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
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
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {whatWords}
              </div>
              {whatError && (
                <p className="mt-1 text-sm text-red-500">
                  {whatError.message as string}
                </p>
              )}
            </div>
          </div>

          {/* OUTCOME (optional) */}
          <div className="space-y-2">
            <FormLabel
              htmlFor={`step-${step.id}-outcome`}
              className="block font-medium text-gray-700"
            >
              What was the outcome of this step? (optional)
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-outcome`}
                value={outcome}
                onChange={e => setOutcome(e.target.value)}
                placeholder="Highlight the key skills, tools, or resources you utilized..."
                className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
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
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {outcomeWords}
              </div>
              {outcomeError && (
                <p className="mt-1 text-sm text-red-500">
                  {outcomeError.message as string}
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            className="mt-2 rounded-xl px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: "#444ec1" }}
            onClick={handleSave}
          >
            Save Step {step.position}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
