/**
 * @file app/dashboard/job-picks/_components/classification-select.tsx
 * @description
 * Client helper to render a Shadcn Select that posts a value via a hidden input.
 * Useful for server actions that rely on standard form POST.
 *
 * Props:
 * - name: Form field name to submit
 * - options: Allowed string options
 * - defaultValue?: Initial selection
 * - placeholder?: UI placeholder text
 */

"use client"

import { useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"

interface ClassificationSelectProps {
  name: string
  options: string[]
  defaultValue?: string
  placeholder?: string
}

export default function ClassificationSelect({
  name,
  options,
  defaultValue,
  placeholder
}: ClassificationSelectProps) {
  const [value, setValue] = useState<string | undefined>(defaultValue)

  return (
    <div className="w-full">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || "Select classification"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Hidden input so value is included in standard form submit */}
      <input type="hidden" name={name} value={value || ""} />
    </div>
  )
}