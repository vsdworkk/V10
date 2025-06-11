"use client"

// Displays a three-dot progress indicator based on word count requirements
import React from "react"
import { ZodTypeAny } from "zod"

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getLimits(schema: ZodTypeAny) {
  const desc = (schema as any).description
  if (!desc) return null
  try {
    const data = JSON.parse(desc)
    if (
      typeof data.minWords === "number" &&
      typeof data.maxWords === "number"
    ) {
      return { min: data.minWords, max: data.maxWords }
    }
  } catch {
    return null
  }
  return null
}

interface WordCountIndicatorProps {
  schema: ZodTypeAny
  text: string
}

export default function WordCountIndicator({
  schema,
  text
}: WordCountIndicatorProps) {
  const limits = getLimits(schema)
  const count = countWords(text)

  if (!limits || count === 0) return null

  const { min, max } = limits
  const fiftyOver = Math.floor(min * 1.5)

  let active = 0
  let color = ""
  let message = ""

  if (count > max) {
    active = 3
    color = "bg-green-500"
    message = "Over limit"
  } else if (count >= fiftyOver) {
    active = 3
    color = "bg-green-500"
    message = "Excellent!"
  } else if (count >= min) {
    active = 2
    color = "bg-yellow-500"
    message = "Much better"
  } else {
    active = 1
    color = "bg-red-500"
    message = "You can do better than this..."
  }

  return (
    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
      <div className="flex space-x-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className={`size-1.5 rounded-full ${i < active ? color : "bg-gray-300"}`}
          />
        ))}
      </div>
      <span>{message}</span>
    </div>
  )
}
