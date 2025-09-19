/**
 * @file app/dashboard/job-picks/_components/classification-multi-select.tsx
 * @description
 * Client component for selecting multiple APS classifications using checkboxes.
 * Posts selected values as a JSON array via hidden input for server actions.
 *
 * Props:
 * - name: Form field name to submit
 * - options: Available classification options
 * - defaultValue?: Initial selections as array
 * - placeholder?: UI placeholder text
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, X } from "lucide-react"

interface ClassificationMultiSelectProps {
  name: string
  options: string[]
  defaultValue?: string[]
  placeholder?: string
}

export default function ClassificationMultiSelect({
  name,
  options,
  defaultValue = [],
  placeholder = "Select classifications"
}: ClassificationMultiSelectProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue)
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (value: string) => {
    setSelectedValues(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const handleRemove = (value: string) => {
    setSelectedValues(prev => prev.filter(item => item !== value))
  }

  const handleClear = () => {
    setSelectedValues([])
  }

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between text-left font-normal"
          >
            <div className="flex flex-wrap gap-1">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : selectedValues.length <= 3 ? (
                selectedValues.map(value => (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="text-xs"
                    onClick={e => {
                      e.stopPropagation()
                      handleRemove(value)
                    }}
                  >
                    {value}
                    <X className="ml-1 size-3 cursor-pointer" />
                  </Badge>
                ))
              ) : (
                <span className="text-sm">
                  {selectedValues.length} classifications selected
                </span>
              )}
            </div>
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Select Classifications ({selectedValues.length} of{" "}
                {options.length})
              </span>
              {selectedValues.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            <Separator />
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {options.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${name}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleSelect(option)}
                  />
                  <label
                    htmlFor={`${name}-${option}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={JSON.stringify(selectedValues)} />
    </div>
  )
}
