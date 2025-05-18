// app/(wizard)/dashboard/new/_components/section-progress-bar.tsx
"use client"

import { Section } from "@/types"
import clsx from "clsx"

interface SectionProgressSidebarProps {
  current?: Section
  maxCompleted?: Section
  onNavigate?: (section: Section) => void
  className?: string
  orientation?: "vertical" | "horizontal"
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

export default function SectionProgressSidebar({
  current = "INTRO",
  maxCompleted = "INTRO",
  onNavigate,
  className,
  orientation = "vertical"
}: SectionProgressSidebarProps) {
  const containerClasses = clsx(
    "w-full",
    orientation === "vertical"
      ? "space-y-6"
      : "flex space-x-4 overflow-x-auto pb-4",
    className
  )

  return (
    <div className={containerClasses}>
      {STEP_ORDER.map((step, idx) => {
        // Check if step is completed based on maxCompleted, not current
        const isCompleted =
          STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(maxCompleted) ||
          step === maxCompleted
        const isActive = step === current
        const isUpcoming = !isCompleted && !isActive

        // Allow clicking on any completed step
        const clickable = isCompleted && !!onNavigate

        return (
          <button
            key={step}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onNavigate?.(step)}
            aria-current={isActive ? "step" : undefined}
            className={clsx(
              "flex items-center whitespace-nowrap transition-all duration-200 rounded-xl p-4",
              orientation === "vertical"
                ? "w-full text-left"
                : "flex-col text-center min-w-20",
              {
                "bg-blue-50": isActive,
                "hover:bg-gray-50 group": clickable || isUpcoming
              }
            )}
          >
            {/* Step number */}
            <div
              className={clsx(
                "flex items-center justify-center rounded-full font-medium border-2",
                orientation === "vertical" ? "w-10 h-10" : "w-8 h-8 mx-auto",
                {
                  "bg-blue-500 border-blue-500 text-white shadow-md": isActive,
                  "bg-blue-500 border-blue-500 text-white shadow-sm":
                    isCompleted && !isActive,
                  "bg-white border-gray-300 text-gray-500 shadow-sm": isUpcoming
                }
              )}
            >
              {idx + 1}
            </div>

            {/* Label */}
            <span
              className={clsx(
                orientation === "vertical" ? "ml-4 text-sm" : "mt-2 text-xs",
                {
                  "text-blue-900": isActive,
                  "text-gray-500": isUpcoming || (isCompleted && !isActive)
                }
              )}
            >
              {STEP_LABELS[step]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
