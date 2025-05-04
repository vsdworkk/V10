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
import { Plus, Check } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { isString } from "@/types"
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
      const parsedSteps = storedAction.steps.map((step: any, index: number) => ({
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
      }))
      if (parsedSteps.length > 0) {
        setSteps(parsedSteps)
        return
      }
    } else if (isString(storedAction)) {
      // Legacy string-based action data
      try {
        const sections = storedAction.split("--")
        if (sections.length > 1) {
          const parsedSteps = sections.map((section: string, index: number) => {
            const lines = section.trim().split("\n")
            let title = ""
            let howText = ""
            let outcomeText = ""

            lines.forEach((line: string) => {
              if (line.startsWith("Step ") && line.includes(":")) {
                title = line.split(":")[1].trim()
              } else if (line.startsWith("How:")) {
                howText = line.replace("How:", "").trim()
              } else if (line.startsWith("Outcome:")) {
                outcomeText = line.replace("Outcome:", "").trim()
              }
            })

            return {
              id: uuidv4(),
              position: index + 1,
              "what-did-you-specifically-do-in-this-step": title,
              "how-did-you-do-it-tools-methods-or-skills": howText,
              "what-was-the-outcome-of-this-step-optional": outcomeText,
              isCompleted: Boolean(title && howText),
              // Set fixed title for display
              title: `Step ${index + 1}`,
              description: `How: ${howText}\n${
                outcomeText ? `Outcome: ${outcomeText}` : ""
              }`
            }
          })

          if (parsedSteps.length > 0) {
            setSteps(parsedSteps)
            return
          }
        }
      } catch (e) {
        console.error("Error parsing legacy action steps:", e)
      }
    }

    // If no existing data, create a default single step
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
      }
    ])
  }, [steps.length, storedAction])

  /**
   * Update the form whenever our local steps change
   */
  const updateActionValue = (updatedSteps: ActionStepType[]) => {
    const stepData = updatedSteps
      .filter(
        (s) =>
          s["what-did-you-specifically-do-in-this-step"]?.trim() ||
          s["how-did-you-do-it-tools-methods-or-skills"]?.trim()
      )
      .map((step) => ({
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
    const updatedSteps = steps.map((step) => {
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
      title: "Step 1",
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Action</h2>
          
          <div className="space-y-4">
            <Accordion
              type="single"
              collapsible
              value={openStep}
              onValueChange={handleValueChange}
              className="space-y-2"
            >
              {steps.map((step) => (
                <StepItem key={step.id} step={step} onSave={handleSaveStep} />
              ))}
            </Accordion>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              disabled={hasReachedMaxSteps}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Step {steps.length + 1}
            </Button>
            {hasReachedMaxSteps && (
              <p className="text-xs text-muted-foreground">
                You've reached the maximum number of steps ({MAX_STEPS}).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepItemProps {
  step: ActionStepType
  onSave: (
    stepId: string,
    what: string,
    how: string,
    outcome: string
  ) => void
}

/**
 * Renders a single collapsible step item.
 */
function StepItem({ step, onSave }: StepItemProps) {
  const [what, setWhat] = useState(step["what-did-you-specifically-do-in-this-step"])
  const [how, setHow] = useState(step["how-did-you-do-it-tools-methods-or-skills"])
  const [outcome, setOutcome] = useState(step["what-was-the-outcome-of-this-step-optional"])
  
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
        "border rounded-md p-0 overflow-hidden",
        step.isCompleted ? "border-green-200 bg-green-50" : "border-muted"
      )}
    >
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div
              className={cn(
                "w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs",
                step.isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-muted-foreground/20"
              )}
            >
              {step.position}
            </div>
            <span
              className={cn(
                "font-medium flex-grow text-left",
                !step.isCompleted && "text-muted-foreground"
              )}
            >
              {/* Always show "Step N" regardless of completion status or content */}
              {`Step ${step.position}`}
            </span>
          </div>
          {step.isCompleted && (
            <div className="flex-shrink-0 mr-2">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-2">
        <div className="space-y-3">
          {/* WHAT */}
          <div className="space-y-1">
            <FormLabel htmlFor={`step-${step.id}-what`} className="block text-gray-700 font-medium">
              What did you specifically do in this step?
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-what`}
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                placeholder="I analyzed the log files to identify error patterns."
                className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {whatWords}
              </div>
            </div>
          </div>

          {/* HOW */}
          <div className="space-y-1">
            <FormLabel htmlFor={`step-${step.id}-how`} className="block text-gray-700 font-medium">
              How did you do it? (tools, methods, or skills)
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-how`}
                value={how}
                onChange={(e) => setHow(e.target.value)}
                placeholder="I used log analysis tools and debugging techniques."
                className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {howWords}
              </div>
            </div>
          </div>

          {/* OUTCOME (optional) */}
          <div className="space-y-1">
            <FormLabel htmlFor={`step-${step.id}-outcome`} className="block text-gray-700 font-medium">
              What was the outcome of this step? (optional)
            </FormLabel>
            <div className="relative">
              <Textarea
                id={`step-${step.id}-outcome`}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="I pinpointed a memory leak in a specific module."
                className="w-full p-4 border-l-4 border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white shadow-sm min-h-24 transition-all duration-300 text-gray-700"
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {outcomeWords}
              </div>
            </div>
          </div>

          <Button type="button" size="sm" className="mt-2" onClick={handleSave}>
            Save Step {step.position}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}