// app/(wizard)/dashboard/new/components/steps/guidance-step.tsx
"use client"

import { useFormContext } from "react-hook-form"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { debugLog } from "@/lib/debug"
import { PitchWizardFormData } from "../wizard/schema"
import { useParams } from "next/navigation"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import BoldExtension from "@tiptap/extension-bold"
import BulletListExtension from "@tiptap/extension-bullet-list"
import OrderedListExtension from "@tiptap/extension-ordered-list"
import ListItemExtension from "@tiptap/extension-list-item"

interface GuidanceStepProps {
  pitchId?: string // Accept pitchId as an optional prop
  // Centralized guidance state from wizard hook
  isGuidanceLoading?: boolean
  guidanceData?: string | null
  guidanceError?: string | null
  guidanceRequestId?: string | null
  fetchGuidance?: (
    jobDescription: string,
    relevantExperience: string,
    userId: string,
    pitchId?: string
  ) => Promise<void>
}

// Component to display guidance content with TipTap formatting
function GuidanceDisplay({ content }: { content: string }) {
  // Parse content - handle both old plain text and new JSON
  let editorContent
  try {
    editorContent = JSON.parse(content)
  } catch {
    // Fallback for old plain text format
    editorContent = `<div class="whitespace-pre-wrap">${content}</div>`
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      BoldExtension,
      BulletListExtension,
      OrderedListExtension,
      ListItemExtension
    ],
    content: editorContent,
    editable: false, // Read-only
    editorProps: {
      attributes: {
        class: "text-sm focus:outline-none"
      }
    }
  })

  return (
    <div className="guidance-content">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .guidance-content p {
            margin-bottom: 0.75rem;
            line-height: 1.5;
          }
          .guidance-content p:last-child {
            margin-bottom: 0;
          }
          .guidance-content ul {
            margin-bottom: 0.75rem;
            list-style-type: disc;
            padding-left: 1.25rem;
          }
          .guidance-content ul:last-child {
            margin-bottom: 0;
          }
          .guidance-content li {
            margin-bottom: 0.375rem;
            display: list-item;
            line-height: 1.5;
          }
          .guidance-content li:last-child {
            margin-bottom: 0;
          }
          .guidance-content ul ul {
            margin-top: 0.375rem;
            margin-bottom: 0.375rem;
            list-style-type: disc;
            padding-left: 1.25rem;
          }
          .guidance-content h1, .guidance-content h2, .guidance-content h3 {
            margin-bottom: 0.5rem;
            margin-top: 1rem;
            line-height: 1.3;
          }
          .guidance-content h1:first-child, .guidance-content h2:first-child, .guidance-content h3:first-child {
            margin-top: 0;
          }
          .guidance-content ol {
            margin-bottom: 0.75rem;
            list-style-type: decimal;
            padding-left: 1.25rem;
          }
          .guidance-content ol li {
            display: list-item;
          }
          
          /* Mobile-specific styles */
          @media (max-width: 768px) {
            .guidance-content p {
              margin-bottom: 0.5rem;
              line-height: 1.4;
            }
            .guidance-content ul, .guidance-content ol {
              margin-bottom: 0.5rem;
              padding-left: 1rem;
            }
            .guidance-content li {
              margin-bottom: 0.25rem;
            }
            .guidance-content h1, .guidance-content h2, .guidance-content h3 {
              margin-bottom: 0.375rem;
              margin-top: 0.75rem;
            }
          }
        `
        }}
      />
      <EditorContent editor={editor} />
    </div>
  )
}

export default function GuidanceStep({
  pitchId: pitchIdFromProp,
  isGuidanceLoading = false,
  guidanceData = null,
  guidanceError = null,
  guidanceRequestId = null,
  fetchGuidance: fetchGuidanceFromWizard
}: GuidanceStepProps) {
  const { watch, setValue, getValues, formState } =
    useFormContext<PitchWizardFormData>()
  const { errors } = formState
  const params = useParams()

  const userId = watch("userId")
  const roleName = watch("roleName")
  const roleLevel = watch("roleLevel")
  const relevantExperience = watch("relevantExperience")
  const roleDescription = watch("roleDescription")
  const albertGuidance = watch("albertGuidance") // existing guidance
  const starExamplesCount = watch("starExamplesCount")
  const pitchWordLimit = watch("pitchWordLimit")

  const definitivePitchId = pitchIdFromProp || (params?.pitchId as string)

  // Use centralized guidance state from wizard hook
  const isLoading = isGuidanceLoading
  const guidance = guidanceData
  const error = guidanceError
  const requestId = guidanceRequestId
  const fetchGuidance = fetchGuidanceFromWizard

  // Note: Initial guidance triggering is now handled in the wizard hook

  // Manual retry handler
  const handleRefetchGuidance = () => {
    if (
      roleDescription &&
      relevantExperience &&
      userId &&
      definitivePitchId &&
      fetchGuidance
    ) {
      fetchGuidance(
        roleDescription,
        relevantExperience,
        userId,
        definitivePitchId
      )
    }
  }

  const possibleStarCounts = ["2", "3", "4"]
  const starCount = starExamplesCount || "2"
  const recommendedCount =
    pitchWordLimit < 550 ? "2" : pitchWordLimit <= 700 ? "3" : "4"

  debugLog(
    "[GuidanceStep] Rendering with albertGuidance (from form watch):",
    albertGuidance
  )

  return (
    <div className="px-2 py-1 sm:p-6">
      {/* Mobile-optimized scrollable container with proper bottom padding for mobile nav */}
      <div className="flex h-[calc(100vh-200px)] flex-col gap-4 overflow-y-auto pb-20 pr-1 sm:h-[500px] sm:gap-6 sm:pb-2 sm:pr-2">
        {!isLoading && !error && albertGuidance && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
              AI Suggestions
            </h3>

            <div
              className="mb-3 rounded-lg border p-3 sm:mb-4 sm:rounded-xl sm:p-4"
              style={{ backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }}
            >
              <p
                className="text-xs leading-relaxed sm:text-sm"
                style={{ color: "#444ec1" }}
              >
                <strong>Note:</strong> The suggestions below were generated by
                AI analyzing your experience and job description to spark ideas
                and help you recall impactful moments. These examples won't
                carry forward automatically—you choose what to use in upcoming
                sections. If you have experiences that better highlight your
                capabilities, you're encouraged to draw on those instead.
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center space-y-3 py-6 sm:py-4">
            <RefreshCw
              className="size-6 animate-spin sm:size-8"
              style={{ color: "#444ec1" }}
            />
            <p className="text-sm font-medium sm:text-base">
              Generating AI Guidance...
            </p>
            <p className="px-4 text-center text-xs text-gray-500">
              This can take up to 2 minutes, please do not refresh.
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div
            className="rounded-lg border p-4 text-center sm:rounded-xl sm:p-5"
            role="alert"
            aria-live="polite"
            style={{ backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }}
          >
            <div
              className="mb-2 text-sm font-semibold sm:text-base"
              style={{ color: "#444ec1" }}
            >
              Oops! We ran into a hiccup
            </div>
            <p
              className="mb-3 text-xs leading-relaxed sm:mb-4 sm:text-sm"
              style={{ color: "#444ec1" }}
            >
              It looks like something went wrong while trying to generate your
              suggestions. This can happen if the service is busy or your
              internet connection briefly dropped.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleRefetchGuidance}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:brightness-110 active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm"
                style={{ backgroundColor: "#444ec1" }}
              >
                <RefreshCw className="size-3 sm:size-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && albertGuidance && (
          <Card className="rounded-lg border border-gray-200 bg-gray-50 sm:rounded-xl">
            <CardContent className="px-4 pt-4 sm:px-6 sm:pt-6">
              <GuidanceDisplay content={albertGuidance} />
            </CardContent>
          </Card>
        )}

        {/* STAR examples count chooser - Mobile optimized */}
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm font-medium text-gray-700 sm:text-base">
            How many examples would you like to include?
          </p>

          {/* Mobile: Stack vertically, Desktop: Grid */}
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
            {possibleStarCounts.map(val => (
              <div key={val} className="flex flex-col items-center gap-1">
                <button
                  onClick={() =>
                    setValue("starExamplesCount", val as any, {
                      shouldDirty: true
                    })
                  }
                  className={`flex h-14 w-full flex-col items-center justify-center rounded-lg transition-all duration-200 active:scale-95 sm:h-16 sm:rounded-xl ${
                    starCount === val
                      ? "font-medium"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  style={
                    starCount === val
                      ? { backgroundColor: "#eef2ff", color: "#444ec1" }
                      : {}
                  }
                >
                  <span className="text-lg font-semibold sm:text-xl">
                    {val}
                  </span>
                  {recommendedCount === val && (
                    <span
                      className="flex items-center gap-1 px-2 text-center text-xs font-medium"
                      style={{ color: "#444ec1" }}
                    >
                      <span>✨ </span>
                      <span className="hidden sm:inline">
                        Recommended by Recruiters
                      </span>
                      <span className="sm:hidden">Recommended</span>
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {errors.starExamplesCount && (
            <p className="text-xs text-red-500 sm:text-sm">
              {errors.starExamplesCount.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
