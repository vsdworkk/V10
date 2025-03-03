/**
@description
Client sub-component for the "Action" portion of a STAR example.
Prompts user for:
1) Approach
2) Skills used
3) Collaboration
We combine them into a single labeled string, storing it at starExampleX.action.

Key Features:
- React Hook Form context
- Three sub-fields
- Single string output on blur
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

interface ActionStepProps {
  exampleKey: "starExample1" | "starExample2"
}

export default function ActionStep({ exampleKey }: ActionStepProps) {
  const { setValue } = useFormContext<PitchWizardFormData>()

  const [approachValue, setApproachValue] = useState("")
  const [skillsValue, setSkillsValue] = useState("")
  const [collabValue, setCollabValue] = useState("")

  const buildActionString = (
    approach: string,
    skills: string,
    collaboration: string
  ) => {
    let result = ""
    if (approach.trim()) {
      result += `Approach: ${approach.trim()}\n`
    }
    if (skills.trim()) {
      result += `Skills used: ${skills.trim()}\n`
    }
    if (collaboration.trim()) {
      result += `Collaboration: ${collaboration.trim()}`
    }
    return result.trim()
  }

  const handleBlur = () => {
    const finalString = buildActionString(
      approachValue,
      skillsValue,
      collabValue
    )
    setValue(`${exampleKey}.action`, finalString, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <FormField
        name="dummy-action1"
        render={() => (
          <FormItem>
            <FormLabel>Approach</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your approach or plan of action..."
                value={approachValue}
                onChange={e => setApproachValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="dummy-action2"
        render={() => (
          <FormItem>
            <FormLabel>Skills Used</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List the particular skills, techniques, or methods you applied..."
                value={skillsValue}
                onChange={e => setSkillsValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="dummy-action3"
        render={() => (
          <FormItem>
            <FormLabel>Collaboration</FormLabel>
            <FormControl>
              <Input
                placeholder="Who did you work with? How did you collaborate?"
                value={collabValue}
                onChange={e => setCollabValue(e.target.value)}
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