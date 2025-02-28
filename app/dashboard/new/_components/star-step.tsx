/**
 * @description
 * Client sub-component for wizard Step 3: STAR Examples.
 * Collects:
 *  - starExample1 (required)
 *  - starExample2 (optional if pitchWordLimit >= 650)
 *
 * Key Features:
 * - React Hook Form context
 * - Conditionally render second STAR example
 *
 * @dependencies
 * - React Hook Form
 * - Shadcn UI
 *
 * @notes
 * - Next step is Final Review
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
  const pitchLimit = watch("pitchWordLimit")

  return (
    <div className="space-y-8">
      {/* STAR Example 1 */}
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
                <Textarea placeholder="Describe the context or situation..." {...field} />
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
                <Textarea placeholder="What was your responsibility or goal?" {...field} />
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
                <Textarea placeholder="What action(s) did you take?" {...field} />
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
                <Textarea placeholder="What were the outcomes or results?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* STAR Example 2 (only if pitchWordLimit >= 650) */}
      {pitchLimit >= 650 && (
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
                  <Textarea placeholder="Describe the context or situation..." {...field} />
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
                  <Textarea placeholder="What was your responsibility or goal?" {...field} />
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
                  <Textarea placeholder="What action(s) did you take?" {...field} />
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
                  <Textarea placeholder="What were the outcomes or results?" {...field} />
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