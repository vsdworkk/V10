/**
@description
Client sub-component to capture the "Task" portion of a STAR example.
Prompts user for:
1) Objectives
2) Responsibilities
3) Constraints
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TaskStepProps {
  /**
   * exampleKey indicates starExample1 or starExample2
   */
  exampleKey: "starExample1" | "starExample2"
}

export default function TaskStep({ exampleKey }: TaskStepProps) {
  const { setValue } = useFormContext<PitchWizardFormData>()

  const [objectivesValue, setObjectivesValue] = useState("")
  const [responsibilitiesValue, setResponsibilitiesValue] = useState("")
  const [constraintsValue, setConstraintsValue] = useState("")

  // Helper to build final labeled string
  const buildTaskString = (
    objectives: string,
    responsibilities: string,
    constraints: string
  ) => {
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

  const handleBlur = () => {
    const finalString = buildTaskString(
      objectivesValue,
      responsibilitiesValue,
      constraintsValue
    )
    setValue(`${exampleKey}.task`, finalString, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Task</h2>
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