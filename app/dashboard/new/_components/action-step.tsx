/**
@description
Client sub-component for the "Action" portion of a STAR example.
Prompts user for:
1. Approach
2. Skills used
3. Collaboration

We combine them into a single labeled string, storing it at starExampleX.action.

Key Features:
- React Hook Form context
- Three sub-fields
- Single string output on blur
- Now includes a heading structure with "STAR Example One/Two" as the main h2 heading
  and "Action" as an h3 sub-heading underneath.

@notes
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
@interface ActionStepProps
@exampleKey indicates whether it's starExample1 or starExample2
*/
interface ActionStepProps {
  exampleKey: "starExample1" | "starExample2"
}

/**
@function ActionStep
Combines sub-fields (approach, skills used, collaboration) into a single
string for the "Action" portion of a STAR example. We set the result in
starExampleX.action on blur.

We include a heading structure with "STAR Example One/Two" as the main h2 heading
and "Action" as an h3 sub-heading underneath.
*/
export default function ActionStep({ exampleKey }: ActionStepProps) {
  const { setValue } = useFormContext()

  const [approachValue, setApproachValue] = useState("")
  const [skillsValue, setSkillsValue] = useState("")
  const [collabValue, setCollabValue] = useState("")

  function buildActionString(
    approach: string,
    skills: string,
    collaboration: string
  ): string {
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

  function handleBlur() {
    const finalString = buildActionString(
      approachValue,
      skillsValue,
      collabValue
    )
    setValue(`${exampleKey}.action`, finalString, { shouldDirty: true })
  }

  // Derive "One" or "Two"
  const exampleNumber = exampleKey === "starExample1" ? "One" : "Two"

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          STAR Example {exampleNumber}
        </h2>
        <h3 className="text-md font-medium mt-1">
          Action
        </h3>
      </div>

      {/* Approach */}
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

      {/* Skills Used */}
      <FormField
        name="dummy-action2"
        render={() => (
          <FormItem>
            <FormLabel>Skills Used</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List the skills, techniques, or methods you applied..."
                value={skillsValue}
                onChange={e => setSkillsValue(e.target.value)}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Collaboration */}
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