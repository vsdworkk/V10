"use client"

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
import { Plus, Check, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
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
          "how-did-you-do-it-tools-methods-or-skills":
            step["how-did-you-do-it-tools-methods-or-skills"] || "",
          "what-was-the-outcome-of-this-step-optional":
            step["what-was-the-outcome-of-this-step-optional"] || "",
          isCompleted: Boolean(
            step["what-did-you-specifically-do-in-this-step"] &&
              step["how-did-you-do-it-tools-methods-or-skills"]
          ),
          // Set fixed title for display
          title: `Step ${index + 1}`,
          description: `How: ${
            step["how-did-you-do-it-tools-methods-or-skills"] || ""
          }\nOutcome: ${
            step["what-was-the-outcome-of-this-step-optional"] || ""
          }`
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
        "how-did-you-do-it-tools-methods-or-skills": "",
        "what-was-the-outcome-of-this-step-optional": "",
        isCompleted: false,
        title: "Step 1",
        description: ""
      },
      {
        id: uuidv4(),
        position: 2,
        "what-did-you-specifically-do-in-this-step": "",
        "how-did-you-do-it-tools-methods-or-skills": "",
        "what-was-the-outcome-of-this-step-optional": "",
        isCompleted: false,
        title: "Step 2",
        description: ""
      },
      {
        id: uuidv4(),
        position: 3,
        "what-did-you-specifically-do-in-this-step": "",
        "how-did-you-do-it-tools-methods-or-skills": "",
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
      .filter(
        s =>
          s["what-did-you-specifically-do-in-this-step"]?.trim() ||
          s["how-did-you-do-it-tools-methods-or-skills"]?.trim()
      )
      .map(step => ({
        stepNumber: step.position,
        "what-did-you-specifically-do-in-this-step":
          step["what-did-you-specifically-do-in-this-step"] || "",
        "how-did-you-do-it-tools-methods-or-skills":
          step["how-did-you-do-it-tools-methods-or-skills"] || "",
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
  const handleSaveStep = (
    stepId: string,
    what: string,
    how: string,
    outcome: string
  ) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          "what-did-you-specifically-do-in-this-step": what,
          "how-did-you-do-it-tools-methods-or-skills": how,
          "what-was-the-outcome-of-this-step-optional": outcome,
          isCompleted: Boolean(what.trim() && how.trim()),
          // Keep title as Step N instead of setting it to the 'what' value
          title: `Step ${step.position}`,
          description: `How: ${how}\n${outcome ? `Outcome: ${outcome}` : ""}`
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
      "how-did-you-do-it-tools-methods-or-skills": "",
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
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-6">
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
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline transition-all">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mr-3 shadow-md border border-amber-200">
                <div className="relative">
                  <Lightbulb
                    className="h-5 w-5 text-amber-400 drop-shadow-sm"
                    style={{
                      filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-amber-300/0 rounded-full" />
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
              <div className="space-y-4 ml-6">
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-3 shadow-md border border-blue-200">
                <div className="relative">
                  <Check
                    className="h-5 w-5 text-blue-500 drop-shadow-sm"
                    style={{
                      filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-blue-300/0 rounded-full" />
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
                  <StepItem key={step.id} step={step} onSave={handleSaveStep} />
                ))}
              </Accordion>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStep}
                disabled={hasReachedMaxSteps}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-600 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 flex items-center justify-center group mt-4"
              >
                <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
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
  onSave: (stepId: string, what: string, how: string, outcome: string) => void
}

/**
 * Renders a single collapsible step item.
 */
function StepItem({ step, onSave }: StepItemProps) {
  const [what, setWhat] = useState(
    step["what-did-you-specifically-do-in-this-step"]
  )
  const [how, setHow] = useState(
    step["how-did-you-do-it-tools-methods-or-skills"]
  )
  const [outcome, setOutcome] = useState(
    step["what-was-the-outcome-of-this-step-optional"]
  )

  // Word counts
  const whatWords = countWords(what || "")
  const howWords = countWords(how || "")
  const outcomeWords = countWords(outcome || "")

  useEffect(() => {
    setWhat(step["what-did-you-specifically-do-in-this-step"])
    setHow(step["how-did-you-do-it-tools-methods-or-skills"])
    setOutcome(step["what-was-the-outcome-of-this-step-optional"])
  }, [step])

  const handleSave = () => {
    onSave(step.id, what ?? "", how ?? "", outcome ?? "")
  }

  return (
    <AccordionItem
      value={step.id}
      className={cn(
        "border rounded-xl overflow-hidden transition-colors duration-200",
        step.isCompleted
          ? "border-blue-100 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline transition-all">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm",
                step.isCompleted
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              )}
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
              className="block text-gray-700 font-medium"
            >
              What did you specifically do in this step?
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-what`}
                value={what}
                onChange={e => setWhat(e.target.value)}
                placeholder="I analyzed the log files to identify error patterns."
                className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {whatWords}
              </div>
            </div>
          </div>

          {/* HOW */}
          <div className="space-y-2">
            <FormLabel
              htmlFor={`step-${step.id}-how`}
              className="block text-gray-700 font-medium"
            >
              How did you do it? (tools, methods, or skills)
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-how`}
                value={how}
                onChange={e => setHow(e.target.value)}
                placeholder="I used log analysis tools and debugging techniques."
                className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {howWords}
              </div>
            </div>
          </div>

          {/* OUTCOME (optional) */}
          <div className="space-y-2">
            <FormLabel
              htmlFor={`step-${step.id}-outcome`}
              className="block text-gray-700 font-medium"
            >
              What was the outcome of this step? (optional)
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-outcome`}
                value={outcome}
                onChange={e => setOutcome(e.target.value)}
                placeholder="I pinpointed a memory leak in a specific module."
                className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {outcomeWords}
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow mt-2"
            onClick={handleSave}
          >
            Save Step {step.position}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
