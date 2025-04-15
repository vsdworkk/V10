"use client"
import React from "react"

interface AnswerQualityMeterProps {
  /** The current text from the user’s input field. */
  text: string
}

/**
 * @function AnswerQualityMeter
 * Displays a minimal indicator of answer quality using three dots and a label.
 * The level is determined by word count:
 *  - Level 1 (<30 words): "Short" (dots in gray/blue)
 *  - Level 2 (30-59 words): "Good"
 *  - Level 3 (60+ words): "Excellent"
 * 
 * The word count display is removed for a cleaner look.
 */
export function AnswerQualityMeter({ text }: AnswerQualityMeterProps) {
  // Count words in the text input
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  // Determine level based on word count thresholds
  let level = 1
  if (wordCount >= 60) {
    level = 3
  } else if (wordCount >= 30) {
    level = 2
  }

  // Helper function: is a dot active?
  const isDotActive = (dotIndex: number) => level >= dotIndex

  // Choose label text based on level
  let label = "Short"
  if (level === 2) label = "Good"
  else if (level === 3) label = "Excellent"

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      <div className="flex items-center space-x-1">
        <span
          className={
            isDotActive(1)
              ? "h-2 w-2 rounded-full bg-blue-500"
              : "h-2 w-2 rounded-full bg-gray-300"
          }
        />
        <span
          className={
            isDotActive(2)
              ? "h-2 w-2 rounded-full bg-blue-500"
              : "h-2 w-2 rounded-full bg-gray-300"
          }
        />
        <span
          className={
            isDotActive(3)
              ? "h-2 w-2 rounded-full bg-blue-500"
              : "h-2 w-2 rounded-full bg-gray-300"
          }
        />
      </div>
      <span>{label}</span>
    </div>
  )
}