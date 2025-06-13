// Reusable textarea field used in Situation, Task, and Result steps
"use client"

import { useFormContext } from "react-hook-form"
import { ZodTypeAny } from "zod"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import WordCountIndicator from "./word-count-indicator"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface StarFieldComponentProps {
  name: string
  label: React.ReactNode
  placeholder: string
  schema: ZodTypeAny
  text: string
}

export default function StarFieldComponent({
  name,
  label,
  placeholder,
  schema,
  text
}: StarFieldComponentProps) {
  const { control } = useFormContext<PitchWizardFormData>()

  return (
    <FormField
      control={control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mb-2 block font-medium text-gray-700">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              className="min-h-24 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-700 transition-all duration-300"
              style={
                {
                  "--focus-ring-color": "#444ec1",
                  "--focus-border-color": "#444ec1"
                } as React.CSSProperties
              }
              onFocus={e => {
                e.target.style.borderColor = "#444ec1"
                e.target.style.boxShadow = "0 0 0 1px rgba(68, 78, 193, 0.1)"
              }}
              onBlur={e => {
                e.target.style.borderColor = "#e5e7eb"
                e.target.style.boxShadow = "none"
              }}
            />
          </FormControl>
          <WordCountIndicator schema={schema} text={text} fieldName={name} />
        </FormItem>
      )}
    />
  )
}
