"use client"

import { useState } from "react"
import { Section } from "@/types"
import { ChevronDown, ChevronUp, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import clsx from "clsx"

interface MobileProgressHeaderProps {
  current?: Section
  maxCompleted?: Section
  onNavigate?: (section: Section) => void
}

const STEP_ORDER: Section[] = ["INTRO", "ROLE", "EXP", "GUIDE", "STAR", "FINAL"]

const STEP_LABELS: Record<Section, string> = {
  INTRO: "Welcome",
  ROLE: "Role Details",
  EXP: "Your Experience",
  GUIDE: "AI Guidance",
  STAR: "STAR Examples",
  FINAL: "Review & Edit"
}

export default function MobileProgressHeader({
  current = "INTRO",
  maxCompleted = "INTRO",
  onNavigate
}: MobileProgressHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentIndex = STEP_ORDER.indexOf(current) + 1
  const totalSteps = STEP_ORDER.length

  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-lg font-bold text-black">APSPitchPro</span>
          </div>

          {/* Current Step Indicator */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Step {currentIndex} of {totalSteps}
            </div>

            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="size-8 p-0">
                  {isOpen ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="absolute right-4 top-full z-30 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                  {STEP_ORDER.map((step, idx) => {
                    const isCompleted =
                      STEP_ORDER.indexOf(step) <
                        STEP_ORDER.indexOf(maxCompleted) ||
                      step === maxCompleted
                    const isActive = step === current
                    const isUpcoming = !isCompleted && !isActive
                    const clickable = isCompleted && !!onNavigate

                    return (
                      <button
                        key={step}
                        type="button"
                        disabled={!clickable}
                        onClick={() => {
                          if (clickable) {
                            onNavigate?.(step)
                            setIsOpen(false)
                          }
                        }}
                        className={clsx(
                          "w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                          {
                            "bg-purple-50": isActive,
                            "cursor-not-allowed opacity-50":
                              !clickable && !isActive
                          }
                        )}
                      >
                        {/* Step number */}
                        <div
                          className={clsx(
                            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium border mr-3",
                            {
                              "text-white border-transparent":
                                isActive || (isCompleted && !isActive),
                              "bg-white border-gray-300 text-gray-500":
                                isUpcoming
                            }
                          )}
                          style={
                            isActive || (isCompleted && !isActive)
                              ? {
                                  backgroundColor: "#444ec1"
                                }
                              : {}
                          }
                        >
                          {idx + 1}
                        </div>

                        {/* Label */}
                        <span
                          className={clsx("text-sm font-medium", {
                            "text-gray-500":
                              isUpcoming || (isCompleted && !isActive)
                          })}
                          style={isActive ? { color: "#444ec1" } : {}}
                        >
                          {STEP_LABELS[step]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{STEP_LABELS[current]}</span>
            <span>{Math.round((currentIndex / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentIndex / totalSteps) * 100}%`,
                backgroundColor: "#444ec1"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
