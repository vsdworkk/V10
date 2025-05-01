"use client"

import { Section } from "@/types"
import clsx from "clsx"

interface SectionProgressSidebarProps {
  current: Section
  onNavigate?: (section: Section) => void
  className?: string
}

const STEP_ORDER: Section[] = [
  "INTRO",
  "ROLE",
  "EXP",
  "GUIDE",
  "STAR",
  "FINAL"
]

const STEP_LABELS: Record<Section, string> = {
  INTRO: "Welcome",
  ROLE: "Role Details",
  EXP: "Your Experience",
  GUIDE: "Guidance",
  STAR: "STAR Examples",
  FINAL: "Review & Edit"
}

export default function SectionProgressSidebar({
  current,
  onNavigate,
  className,
}: SectionProgressSidebarProps) {
  return (
    <aside
      aria-label="Wizard steps"
      className={clsx(
        "w-80 border-r border-gray-100 bg-white p-8 space-y-6 shadow-lg",
        className
      )}
    >
      {STEP_ORDER.map((step, idx) => {
        const isCompleted = STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(current)
        const isActive = step === current
        const isUpcoming = !isCompleted && !isActive

        const clickable = isCompleted && !!onNavigate

        return (
          <button
            key={step}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onNavigate?.(step)}
            aria-current={isActive ? "step" : undefined}
            className={clsx(
              "flex items-center whitespace-nowrap transition-colors rounded-xl p-4 w-full text-left",
              {
                "bg-blue-50": isActive,
                "hover:bg-gray-50": clickable,
              }
            )}
          >
            {/* Step number */}
            <div
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-full font-medium shadow-sm border-2",
                {
                  "bg-blue-500 border-blue-500 text-white": isActive || isCompleted,
                  "bg-white border-gray-300 text-gray-500": isUpcoming,
                }
              )}
            >
              {idx + 1}
            </div>

            {/* Label */}
            <span
              className={clsx("ml-4 text-sm", {
                "text-blue-900 font-semibold": isActive,
                "text-gray-500": isUpcoming,
                "text-foreground": isCompleted,
              })}
            >
              {STEP_LABELS[step]}
            </span>
          </button>
        )
      })}
    </aside>
  )
}