/**
@description
Client sub-component to capture the "Task" portion of a STAR example.
Prompts user for:
1. Objectives
2. Responsibilities
3. Constraints

On blur, we combine these strings with labels, storing them in starExampleX.task.

Key Features:
- React Hook Form context
- Detailed sub-fields -> single string in form state
- We display a heading h2 at the top to indicate "STAR Example One: Task" or
  "STAR Example Two: Task," depending on the exampleKey.

@notes
Similar structure to situation-step. We keep sub-fields in local state,
then build the final labeled string on blur.
*/

"use client"

import { useFormContext } from "react-hook-form"
import { useState } from "react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
@interface TaskStepProps
@exampleKey indicates starExample1 or starExample2
*/
interface TaskStepProps {
  exampleKey: "starExample1" | "starExample2"
}

/**
@function TaskStep
Renders multiple text fields for user input:
1. Objectives
2. Responsibilities
3. Constraints

Builds a single labeled string on blur and places it in starExampleX.task.
Adds an h2 heading to indicate which example is being filled out.
*/
export default function TaskStep({ exampleKey }: TaskStepProps) {
  const { setValue } = useFormContext()

  const [objectivesValue, setObjectivesValue] = useState("")
  const [responsibilitiesValue, setResponsibilitiesValue] = useState("")
  const [constraintsValue, setConstraintsValue] = useState("")

  /**
   * Build final labeled string for the "Task" section
   */
  function buildTaskString(
    objectives: string,
    responsibilities: string,
    constraints: string
  ): string {
    let result = ""
    if (objectives.trim()) {
      result += `Objectives: ${objectives.trim()}\n`
    }
    if (responsibilities.trim()) {
      result += `Responsibilities: ${responsibilities.trim()}\n`
    }
    if (constraints.trim()) {
      result += `Constraints: ${constraints.trim()}`
    }
    return result.trim()
  }

  /**
   * On blur, store the final string in starExampleX.task
   */
  function handleBlur() {
    const finalString = buildTaskString(
      objectivesValue,
      responsibilitiesValue,
      constraintsValue
    )
    setValue(`${exampleKey}.task`, finalString, { shouldDirty: true })
  }

  // Derive example "One" or "Two"
  const exampleNumber = exampleKey === "starExample1" ? "One" : "Two"

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        STAR Example {exampleNumber}: Task
      </h2>

      {/* Objectives */}
      <FormField
        name="dummy-task1"
        render={() => (
          <FormItem>
            <FormLabel>Objectives</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What were you trying to accomplish?"
                value={objectivesValue}
                onChange={e => setObjectivesValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Responsibilities */}
      <FormField
        name="dummy-task2"
        render={() => (
          <FormItem>
            <FormLabel>Responsibilities</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What specific tasks or duties fell under your role?"
                value={responsibilitiesValue}
                onChange={e => setResponsibilitiesValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Constraints */}
      <FormField
        name="dummy-task3"
        render={() => (
          <FormItem>
            <FormLabel>Constraints</FormLabel>
            <FormControl>
              <Input
                placeholder="Were there any time/budget/resource constraints?"
                value={constraintsValue}
                onChange={e => setConstraintsValue(e.target.value)}
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