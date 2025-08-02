// app/(wizard)/dashboard/new/_components/section-progress-bar.tsx
"use client"

import { Section } from "@/types"
import clsx from "clsx"

interface SectionProgressSidebarProps {
  current?: Section
  maxCompleted?: Section
  onNavigate?: (section: Section) => void
  className?: string
}

const STEP_ORDER: Section[] = ["INTRO", "ROLE", "EXP", "GUIDE", "STAR", "FINAL"]

const STEP_LABELS: Record<Section, string> = {
  INTRO: "Welcome",
  ROLE: "Role Details",
  EXP: "Your Experience",
  GUIDE: "AI Guidance",
  STAR: "Building Your Pitch",
  FINAL: "Review & Edit"
}

export default function SectionProgressSidebar({
  current = "INTRO",
  maxCompleted = "INTRO",
  onNavigate,
  className
}: SectionProgressSidebarProps) {
  return (
    <div className="w-full space-y-6">
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
              "flex items-center whitespace-nowrap transition-all duration-200 rounded-xl p-4 w-full text-left",
              {
                "hover:bg-gray-50 group": clickable || isUpcoming
              }
            )}
            style={isActive ? { backgroundColor: "#f8fafc" } : {}}
          >
            {/* Step number */}
            <div
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-full font-medium border-2",
                {
                  "text-white shadow-md": isActive,
                  "text-white shadow-sm": isCompleted && !isActive,
                  "bg-white border-gray-300 text-gray-500 shadow-sm": isUpcoming
                }
              )}
              style={
                isActive || (isCompleted && !isActive)
                  ? {
                      backgroundColor: "#444ec1",
                      borderColor: "#444ec1"
                    }
                  : {}
              }
            >
              {idx + 1}
            </div>

            {/* Label */}
            <span
              className={clsx("ml-4 text-sm font-medium", {
                "text-gray-500": isUpcoming || (isCompleted && !isActive)
              })}
              style={isActive ? { color: "#444ec1" } : {}}
            >
              {STEP_LABELS[step]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
