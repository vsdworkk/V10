"use client"

// Displays a three-dot progress indicator based on word count requirements
import React, { useEffect, useState } from "react"
import { ZodTypeAny } from "zod"

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getLimits(schema: ZodTypeAny) {
  // Handle ZodEffects (created by .refine()) - get the underlying schema
  let actualSchema = schema
  if ((schema as any)._def?.schema) {
    actualSchema = (schema as any)._def.schema
  }

  const desc = (actualSchema as any).description

  if (!desc) {
    return null
  }
  try {
    const data = JSON.parse(desc)
    if (
      typeof data.minWords === "number" &&
      typeof data.maxWords === "number"
    ) {
      return { min: data.minWords, max: data.maxWords }
    }
  } catch (error) {
    return null
  }
  return null
}

interface WordCountIndicatorProps {
  schema: ZodTypeAny
  text: string
  fieldName?: string // For targeting specific fields for shake animation
}

export default function WordCountIndicator({
  schema,
  text,
  fieldName
}: WordCountIndicatorProps) {
  const limits = getLimits(schema)
  const count = countWords(text)
  const [isShaking, setIsShaking] = useState(false)

  // Listen for shake events
  useEffect(() => {
    const handleShakeEvent = (event: CustomEvent) => {
      const { fieldNames } = event.detail

      // If no fieldName provided or this field is in the target list, shake
      if (!fieldName || fieldNames.includes(fieldName)) {
        setIsShaking(true)

        // Reset shake after animation completes
        setTimeout(() => {
          setIsShaking(false)
        }, 600)
      }
    }

    window.addEventListener("wordCountShake", handleShakeEvent as EventListener)

    return () => {
      window.removeEventListener(
        "wordCountShake",
        handleShakeEvent as EventListener
      )
    }
  }, [fieldName])

  // Return null if we can't get limits from schema
  if (!limits) return null

  const { min, max } = limits
  const fiftyOver = Math.floor(min * 1.5)

  let active = 0
  let color = ""
  let message = ""

  if (count === 0) {
    active = 0
    color = "bg-gray-500"
    message = `Need ${min}-${max} words`
  } else if (count > max) {
    active = 3
    color = "bg-red-500"
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
    <div
      className={`mt-2 flex items-center justify-between text-xs transition-all duration-150 ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      <div className="flex items-center space-x-2 text-gray-500">
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
      <span className="text-gray-400">{count} words</span>
    </div>
  )
}
