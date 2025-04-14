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
   * exampleIndex indicates which starExamples[index] to use
   */
  exampleIndex: number
}

/**
 * @function TaskStep
 * Collects:
 * 1) Responsibility in addressing the issue
 * 2) How completing the task helps solve the problem
 * 3) Constraints/requirements
 *
 * Data is stored in starExamples[exampleIndex].task
 */
export default function TaskStep({ exampleIndex }: TaskStepProps) {
  const { watch, setValue } = useFormContext<PitchWizardFormData>()

  const storedTask = watch(`starExamples.${exampleIndex}.task`)

  const [responsibility, setResponsibility] = useState("")
  const [helpSolve, setHelpSolve] = useState("")
  const [constraints, setConstraints] = useState("")

  const handleBlur = () => {
    setValue(
      `starExamples.${exampleIndex}.task`,
      {
        "what-was-your-responsibility-in-addressing-this-issue": responsibility,
        "how-would-completing-this-task-help-solve-the-problem": helpSolve,
        "what-constraints-or-requirements-did-you-need-to-consider": constraints
      },
      { shouldDirty: true }
    )
  }

  useEffect(() => {
    if (storedTask) {
      if (typeof storedTask === "object") {
        setResponsibility(
          storedTask["what-was-your-responsibility-in-addressing-this-issue"] || ""
        )
        setHelpSolve(
          storedTask["how-would-completing-this-task-help-solve-the-problem"] || ""
        )
        setConstraints(
          storedTask["what-constraints-or-requirements-did-you-need-to-consider"] || ""
        )
      } else if (isString(storedTask)) {
        // Legacy fallback
        const parsedTask = parseLegacyTask(storedTask)
        setResponsibility(
          parsedTask["what-was-your-responsibility-in-addressing-this-issue"] || ""
        )
        setHelpSolve(
          parsedTask["how-would-completing-this-task-help-solve-the-problem"] || ""
        )
        setConstraints(
          parsedTask["what-constraints-or-requirements-did-you-need-to-consider"] || ""
        )
      }
    }
  }, [storedTask])

  return (
    <div className="space-y-4">
      <FormField
        name={`starExamples.${exampleIndex}.task.what-was-your-responsibility-in-addressing-this-issue`}
        render={() => (
          <FormItem>
            <FormLabel>What was your responsibility in addressing this issue?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "I was responsible for diagnosing the software errors and implementing fixes before the product launch."
            </div>
            <FormControl>
              <Textarea
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`starExamples.${exampleIndex}.task.how-would-completing-this-task-help-solve-the-problem`}
        render={() => (
          <FormItem>
            <FormLabel>How would completing this task help solve the problem?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "Fixing the errors promptly would avoid delays and maintain our reputation with clients."
            </div>
            <FormControl>
              <Textarea
                value={helpSolve}
                onChange={(e) => setHelpSolve(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`starExamples.${exampleIndex}.task.what-constraints-or-requirements-did-you-need-to-consider`}
        render={() => (
          <FormItem>
            <FormLabel>What constraints or requirements did you need to consider?</FormLabel>
            <div className="text-sm text-muted-foreground mb-2">
              • Example: "We had limited resources and a deadline of three weeks before launch."
            </div>
            <FormControl>
              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
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