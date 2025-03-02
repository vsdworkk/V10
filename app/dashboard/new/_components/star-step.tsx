/**
@description
Client sub-component for wizard Step 4: STAR Examples (Situation, Task, Action, Result).
We split each major section into its own Card to provide clearer prompts.

Key Features:
- If pitchWordLimit is below 650, only one STAR example is required.
- If pitchWordLimit is 650 or above, we collect two STAR examples.
- Each example has four sub-cards: Situation, Task, Action, Result.
- We present multiple sub-questions within each text area via placeholder guidance.

@notes
The underlying database schema remains the same (starExample1/2 with situation, task,
action, result). We simply reorganize the UI into separate cards and add more prompts.
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"

export default function StarStep() {
  const { control, watch } = useFormContext<PitchWizardFormData>()
  const pitchLimitChoice = watch("pitchWordLimit")

  // Parse the string to see if it's >= 650 (e.g., "<500" -> 500, "<650" -> 650, etc.)
  let numericLimit = 0
  if (typeof pitchLimitChoice === "string") {
    // remove the leading "<", then parseInt
    numericLimit = parseInt(pitchLimitChoice.replace("<", ""), 10)
    if (isNaN(numericLimit)) {
      numericLimit = 0
    }
  }

  /**
   * Renders the group of four Card components (Situation, Task, Action, Result)
   * for a single STAR example (e.g., starExample1, starExample2).
   *
   * @param examplePrefix - "starExample1" or "starExample2"
   * @param label - "STAR Example 1" or "STAR Example 2"
   */
  function renderStarExample(examplePrefix: "starExample1" | "starExample2", label: string) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">{label}</h2>

        {/* SITUATION Card */}
        <Card>
          <CardHeader>
            <CardTitle>Situation</CardTitle>
            <CardDescription className="text-sm">
              <ul className="list-disc pl-4">
                <li>What was the context?</li>
                <li>What was the challenge?</li>
                <li>Who was involved?</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name={`${examplePrefix}.situation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Situation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe context, challenges, and key people involved..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* TASK Card */}
        <Card>
          <CardHeader>
            <CardTitle>Task</CardTitle>
            <CardDescription className="text-sm">
              <ul className="list-disc pl-4">
                <li>What was your responsibility?</li>
                <li>What were your objectives?</li>
                <li>What were the constraints?</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name={`${examplePrefix}.task`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Task</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your responsibilities, objectives, and constraints..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ACTION Card */}
        <Card>
          <CardHeader>
            <CardTitle>Action</CardTitle>
            <CardDescription className="text-sm">
              <ul className="list-disc pl-4">
                <li>What steps did you take?</li>
                <li>How did you use your skills?</li>
                <li>How did you collaborate?</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name={`${examplePrefix}.action`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Action</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the actions you took, skills used, and collaboration efforts..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* RESULT Card */}
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription className="text-sm">
              <ul className="list-disc pl-4">
                <li>What was the outcome?</li>
                <li>What was the impact?</li>
                <li>Can you quantify it?</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name={`${examplePrefix}.result`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Result</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the final outcome or impact, including any measurable results..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Always render the first STAR example */}
      {renderStarExample("starExample1", "STAR Example 1")}

      {/* Conditionally render the second STAR example if numericLimit >= 650 */}
      {numericLimit >= 650 && renderStarExample("starExample2", "STAR Example 2")}
    </div>
  )
}