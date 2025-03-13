/**
@description
Client sub-component to capture the "Task" portion of a STAR example.
Updated to use the new nested StarSchema structure with kebab-case question fields.
Prompts user for:
1) What was your responsibility in addressing this issue?
2) How would completing this task help solve the problem?
3) What constraints or requirements did you need to consider?

Key Features:
- React Hook Form context
- Stores data directly in nested structure with kebab-case question names
- Example ID (starExample1 or starExample2) is determined by props
@notes
Similar structure to situation-step; we use the new nested structure
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
import { isString, parseLegacyTask } from "@/types"

interface TaskStepProps {
  /**
   * exampleKey indicates starExample1 or starExample2
   */
  exampleKey: "starExample1" | "starExample2"
}

export default function TaskStep({ exampleKey }: TaskStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const [responsibility, setResponsibility] = useState("")
  const [helpSolve, setHelpSolve] = useState("")
  const [constraints, setConstraints] = useState("")

  // Watch the current values from the form
  const storedTask = watch(`${exampleKey}.task`)

  const handleBlur = () => {
    // Store data in the new nested structure
    setValue(`${exampleKey}.task`, {
      "what-was-your-responsibility-in-addressing-this-issue": responsibility,
      "how-would-completing-this-task-help-solve-the-problem": helpSolve,
      "what-constraints-or-requirements-did-you-need-to-consider": constraints
    }, { shouldDirty: true })
  }

  // Initialize local state from existing form data if available
  useEffect(() => {
    if (storedTask) {
      // For the new structure, extract values from the nested object
      if (typeof storedTask === 'object') {
        setResponsibility(storedTask["what-was-your-responsibility-in-addressing-this-issue"] || "")
        setHelpSolve(storedTask["how-would-completing-this-task-help-solve-the-problem"] || "")
        setConstraints(storedTask["what-constraints-or-requirements-did-you-need-to-consider"] || "")
      } 
      // Legacy support for old format (string)
      else if (isString(storedTask)) {
        const parsedTask = parseLegacyTask(storedTask);
        setResponsibility(parsedTask["what-was-your-responsibility-in-addressing-this-issue"] || "");
        setHelpSolve(parsedTask["how-would-completing-this-task-help-solve-the-problem"] || "");
        setConstraints(parsedTask["what-constraints-or-requirements-did-you-need-to-consider"] || "");
      }
    }
  }, [storedTask, exampleKey])

  return (
    <div className="space-y-4">
      <FormField
        name={`${exampleKey}.task.what-was-your-responsibility-in-addressing-this-issue`}
        render={() => (
          <FormItem>
            <FormLabel>What was your responsibility in addressing this issue?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I was responsible for quickly finding out why the software errors were happening and then developing a fix before the scheduled product launch."
            </div>
            <FormControl>
              <Textarea
                value={responsibility}
                onChange={e => setResponsibility(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${exampleKey}.task.how-would-completing-this-task-help-solve-the-problem`}
        render={() => (
          <FormItem>
            <FormLabel>How would completing this task help solve the problem or tackle the challenge?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "By identifying and resolving the software issue promptly, we would avoid costly delays and maintain our reputation with key clients."
            </div>
            <FormControl>
              <Textarea
                value={helpSolve}
                onChange={e => setHelpSolve(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${exampleKey}.task.what-constraints-or-requirements-did-you-need-to-consider`}
        render={() => (
          <FormItem>
            <FormLabel>What constraints or requirements did you need to consider?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "We had limited resources and a tight deadline of three weeks before launch."
            </div>
            <FormControl>
              <Textarea
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
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