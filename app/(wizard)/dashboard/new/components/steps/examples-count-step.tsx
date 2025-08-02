/**
 * Client component for selecting the number of STAR examples to include in the pitch.
 * This step comes after the AI Guidance step.
 */
"use client"

import { useFormContext } from "react-hook-form"
import { useState } from "react"
import { Lightbulb } from "lucide-react"
import { PitchWizardFormData } from "../wizard/schema"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"

export default function ExamplesCountStep() {
  const { watch, setValue, formState } = useFormContext<PitchWizardFormData>()
  const { errors } = formState
  const pitchWordLimit = watch("pitchWordLimit")
  const starExamplesCount = watch("starExamplesCount")
  const [tipsOpen, setTipsOpen] = useState<string | undefined>(undefined)

  // Handle STAR example count change
  const handleStarExamplesCountChange = (value: string) => {
    setValue(
      "starExamplesCount",
      value as PitchWizardFormData["starExamplesCount"],
      {
        shouldDirty: true
      }
    )
  }

  const possibleStarCounts = ["2", "3", "4"]
  const starCount = starExamplesCount || "2"
  const recommendedCount =
    pitchWordLimit < 550 ? "2" : pitchWordLimit <= 700 ? "3" : "4"

  return (
    <div className="p-6">
      <div className="flex h-[500px] flex-col gap-6 overflow-y-auto pr-2">
        {/* Tips accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={tipsOpen}
          onValueChange={setTipsOpen}
        >
          <AccordionItem value="examples-count-tips" className="border-none">
            <AccordionTrigger
              className="flex items-center gap-2 rounded-xl p-4 text-sm font-normal transition-colors hover:no-underline"
              style={{
                backgroundColor: "#eef2ff",
                color: "#444ec1"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "#ddd6fe"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "#eef2ff"
              }}
            >
              <Lightbulb className="size-4" />
              <span>Tips for this step</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 text-sm text-gray-700">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Choose how many STAR examples you want to include in your pitch.
                </li>
                <li>
                  Including more examples allows you to showcase more of your relevant skills.
                </li>
                <li>
                  Consider your word limit when choosing the number of examples.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* STAR examples count selector */}
        <div className="space-y-4">
          <p className="font-medium text-gray-700">
            How many examples would you like to include in your pitch?
          </p>
          <div className="grid grid-cols-3 gap-4">
            {possibleStarCounts.map(val => (
              <div key={val} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleStarExamplesCountChange(val)}
                  className={`flex h-16 w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                    starCount === val
                      ? "font-medium"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  style={
                    starCount === val
                      ? {
                          backgroundColor: "#eef2ff",
                          color: "#444ec1"
                        }
                      : {}
                  }
                >
                  <span className="text-lg font-semibold">{val}</span>
                  {recommendedCount === val && (
                    <span
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: "#444ec1" }}
                    >
                      <span>✨</span>
                      Recommended by Recruiters
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
          {errors.starExamplesCount && (
            <p className="text-sm text-red-500">
              {errors.starExamplesCount.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 