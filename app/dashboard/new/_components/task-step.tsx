/**
@description
Client sub-component to capture the "Task" portion of a STAR example.
Updated to use the new StarSchema structure with detailed sub-fields.
Prompts user for:
1) Responsibility in addressing the issue (objective)
2) How completing the task would help solve the problem (requirements)
Stores data in both the main task field and in the taskDetails sub-object.

Key Features:
- React Hook Form context
- Stores data in both the main task field and in the taskDetails sub-object
- Example ID (starExample1 or starExample2) is determined by props
@notes
Similar structure to situation-step; we hold sub-fields in local state, then
build a final labeled string while also storing the structured data.
*/

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useState, useEffect } from "react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface TaskStepProps {
  /**
   * exampleKey indicates starExample1 or starExample2
   */
  exampleKey: "starExample1" | "starExample2"
}

export default function TaskStep({ exampleKey }: TaskStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const [responsibilityValue, setResponsibilityValue] = useState("")
  const [helpSolveValue, setHelpSolveValue] = useState("")

  // Watch the current values from the form
  const storedTask = watch(`${exampleKey}.task`)
  const storedDetails = watch(`${exampleKey}.taskDetails`)

  // Helper to build final labeled string
  const buildTaskString = (
    responsibility: string,
    helpSolve: string
  ) => {
    let result = ""
    if (responsibility.trim()) {
      result += `Responsibility: ${responsibility.trim()}\n`
    }
    if (helpSolve.trim()) {
      result += `How it would help: ${helpSolve.trim()}`
    }
    return result.trim()
  }

  const handleBlur = () => {
    // Create the combined string for backward compatibility
    const finalString = buildTaskString(
      responsibilityValue,
      helpSolveValue
    )
    
    // Store both the main task field and the detailed sub-fields
    setValue(`${exampleKey}.task`, finalString, { shouldDirty: true })
    setValue(`${exampleKey}.taskDetails`, {
      objective: responsibilityValue,
      requirements: helpSolveValue,
    }, { shouldDirty: true })
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    // If we have structured details, use those
    if (storedDetails) {
      setResponsibilityValue(storedDetails.objective || "")
      setHelpSolveValue(storedDetails.requirements || "")
    } 
    // Otherwise, try to parse from the combined string (legacy support)
    else if (storedTask) {
      const lines = storedTask.split('\n')
      lines.forEach(line => {
        if (line.startsWith('Responsibility:')) {
          setResponsibilityValue(line.replace('Responsibility:', '').trim())
        } else if (line.startsWith('How it would help:')) {
          setHelpSolveValue(line.replace('How it would help:', '').trim())
        }
      })
    }
  }, [storedTask, storedDetails, exampleKey])

  return (
    <div className="space-y-4">
      <FormField
        name={`${exampleKey}.taskDetails.objective`}
        render={() => (
          <FormItem>
            <FormLabel>What was your responsibility in addressing this issue?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I was responsible for quickly finding out why the software errors were happening and then developing a fix before the scheduled product launch."
            </div>
            <FormControl>
              <Textarea
                value={responsibilityValue}
                onChange={e => setResponsibilityValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${exampleKey}.taskDetails.requirements`}
        render={() => (
          <FormItem>
            <FormLabel>How would completing this task help solve the problem or tackle the challenge?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "By identifying and resolving the software issue promptly, we would avoid costly delays and maintain our reputation with key clients."
            </div>
            <FormControl>
              <Textarea
                value={helpSolveValue}
                onChange={e => setHelpSolveValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}