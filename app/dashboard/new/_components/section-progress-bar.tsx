"use client"

import { Section } from "@/types"
import clsx from "clsx"
import { motion, LayoutGroup } from "framer-motion"

interface SectionProgressBarProps {
  current: Section
  onNavigate?: (section: Section) => void
}

const SECTION_ORDER: Section[] = [
  "INTRO",
  "ROLE",
  "EXP",
  "GUIDE",
  "STAR",
  "FINAL"
]

const SECTION_LABELS: Record<Section, string> = {
  INTRO: "Introduction",
  ROLE: "Role Details",
  EXP: "Your Experience",
  GUIDE: "Guidance",
  STAR: "STAR Examples",
  FINAL: "Finalise"
}

export default function SectionProgressBar({ current, onNavigate }: SectionProgressBarProps) {
  const isIntro = current === "INTRO"
  return (
    <nav
      aria-label="Wizard progress"
      className="py-2 px-1 sm:px-4 select-none overflow-x-auto"
    >
      <LayoutGroup>
        <ul
          role="list"
          className={clsx(
            "flex justify-center items-center",
            isIntro ? "gap-6" : "gap-4"
          )}
        >
          {SECTION_ORDER.map((sec, idx) => {
            const state: "completed" | "active" | "upcoming" =
              idx < SECTION_ORDER.indexOf(current)
                ? "completed"
                : idx === SECTION_ORDER.indexOf(current)
                ? "active"
                : "upcoming"

            const clickable = state === "completed"

            return (
              <li
                key={sec}
                role="listitem"
                aria-current={state === "active" ? "step" : undefined}
              >
                <button
                  type="button"
                  disabled={!clickable || !onNavigate}
                  onClick={() => onNavigate?.(sec)}
                  aria-label={`Step ${idx + 1} of 6: ${SECTION_LABELS[sec]}`}
                  className={clsx(
                    "flex flex-col items-center whitespace-nowrap transition-colors",
                    isIntro ? "text-base sm:text-lg" : "text-sm sm:text-base",
                    clickable ? "hover:text-primary focus:outline-none" : "cursor-default",
                    state === "active" && "font-semibold text-primary",
                    state === "completed" && "text-foreground",
                    state === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {/* Dot */}
                  {state === "active" ? (
                    <motion.span
                      layoutId="progress-dot"
                      className={clsx(
                        "rounded-full mb-1",
                        isIntro ? "w-6 h-6" : "w-4 h-4",
                        "bg-primary"
                      )}
                    />
                  ) : (
                    <span
                      className={clsx(
                        "rounded-full mb-1",
                        isIntro ? "w-6 h-6" : "w-4 h-4",
                        state === "completed" && "bg-primary",
                        state === "upcoming" && "bg-muted"
                      )}
                    />
                  )}
                  {SECTION_LABELS[sec]}
                </button>
              </li>
            )
          })}
        </ul>
      </LayoutGroup>
    </nav>
  )
} 