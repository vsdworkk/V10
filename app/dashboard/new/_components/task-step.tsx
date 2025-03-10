/**
@description
Client sub-component to capture the "Task" portion of a STAR example.
Prompts user for:
1) Responsibility in addressing the issue
2) How completing the task would help solve the problem
On blur, we combine these strings with labels, storing them in starExampleX.task.

Key Features:
- React Hook Form context
- Detailed sub-fields -> single string in form state
@notes
Similar structure to situation-step; we hold sub-fields in local state, then onBlur
build a final labeled string.
*/

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useState } from "react"
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
  const { setValue } = useFormContext<PitchWizardFormData>()

  const [responsibilityValue, setResponsibilityValue] = useState("")
  const [helpSolveValue, setHelpSolveValue] = useState("")

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
    const finalString = buildTaskString(
      responsibilityValue,
      helpSolveValue
    )
    setValue(`${exampleKey}.task`, finalString, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <FormField
        name="dummy-task1"
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
        name="dummy-task2"
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