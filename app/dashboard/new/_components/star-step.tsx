/**
@description
Client sub-component for wizard Step 4: STAR Examples.
Collects:
 - starExample1 (required)
 - starExample2 (optional if numeric word limit >= 650)

Key Features:
 - React Hook Form context
 - Condition to show second STAR example: parse pitchWordLimit (e.g. "<650") -> numeric
   and check if >= 650

@dependencies
React Hook Form
Shadcn UI

@notes
We replaced direct numeric comparisons with parseInt on the string-based pitchWordLimit.
*/
"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export default function StarStep() {
  const { control, watch } = useFormContext<PitchWizardFormData>()
  const pitchLimitChoice = watch("pitchWordLimit")

  // parse the string to see if it's >= 650
  const numericLimit = typeof pitchLimitChoice === 'string'
    ? parseInt(pitchLimitChoice.substring(1), 10)
    : 0; // default to 0 if not a string to hide optional fields

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">STAR Example 1</h3>

        {/* Situation */}
        <FormField
          control={control}
          name="starExample1.situation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the context or situation..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Task */}
        <FormField
          control={control}
          name="starExample1.task"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What was your responsibility or goal?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action */}
        <FormField
          control={control}
          name="starExample1.action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What action(s) did you take?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Result */}
        <FormField
          control={control}
          name="starExample1.result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Result</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What were the outcomes or results?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* STAR Example 2 (only if numericLimit >= 650) */}
      {numericLimit >= 650 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">STAR Example 2</h3>

          {/* Situation */}
          <FormField
            control={control}
            name="starExample2.situation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the context or situation..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Task */}
          <FormField
            control={control}
            name="starExample2.task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What was your responsibility or goal?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action */}
          <FormField
            control={control}
            name="starExample2.action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What action(s) did you take?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Result */}
          <FormField
            control={control}
            name="starExample2.result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Result</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What were the outcomes or results?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}