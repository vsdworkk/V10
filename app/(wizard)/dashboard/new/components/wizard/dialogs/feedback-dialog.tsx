/**
 * @file FeedbackDialog
 * @description Dialog to capture post-generation user feedback: 1–5 star rating and conditional reasons for low ratings.
 *
 * Responsibilities:
 * - Present a 1–5 star selector.
 * - If rating <= 2, show targeted dissatisfaction reasons and optional free text.
 * - Submit PATCH to /api/pitches/[pitchId] with { pitchRating, ratingReason }.
 * - On success, navigate to /dashboard.
 *
 * Notes:
 * - Follows existing API contract where PATCH /api/pitches/[pitchId] uses updatePitchSchema with new fields added (pitchRating, ratingReason).
 *   Verified route parses body, enforces Clerk auth, and calls updatePitchAction.
 *   Verified schema includes the feedback fields and is .partial(), so only changed fields are required.
 * - Toasts are implemented using the repo's useToast hook pattern and Toaster wiring.
 */

"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface FeedbackDialogProps {
  /**
   * Pitch id to update. Must be a UUID string.
   */
  pitchId: string
  /**
   * Controlled open state.
   */
  open: boolean
  /**
   * Controlled state setter. Called on close or open change.
   */
  onOpenChange: (open: boolean) => void
}

/**
 * Stable keys persisted in ratingReason JSON when rating <= 2.
 * Use string union for type safety on keys.
 */
type LowRatingReasonKey =
  | "questionnaire_unclear"
  | "word_count_mismatch"
  | "robotic_or_generic"
  | "other"

const REASON_LABELS: Record<LowRatingReasonKey, string> = {
  questionnaire_unclear: "The questionnaire was unclear or difficult to complete.",
  word_count_mismatch: "Did not meet the required word count.",
  robotic_or_generic: "Content sounded robotic or generic.",
  other: "Other"
}

/**
 * Serialize the selected reasons + optional text to JSON.
 */
function buildRatingReasonPayload(
  selected: Record<LowRatingReasonKey, boolean>,
  otherText: string
): string {
  const reasons: LowRatingReasonKey[] = []
  for (const key of Object.keys(REASON_LABELS) as LowRatingReasonKey[]) {
    if (selected[key]) reasons.push(key)
  }
  const payload = {
    reasons,
    otherText: otherText?.trim() || ""
  }
  return JSON.stringify(payload)
}

export default function FeedbackDialog({
  pitchId,
  open,
  onOpenChange
}: FeedbackDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  const [reasons, setReasons] = useState<Record<LowRatingReasonKey, boolean>>({
    questionnaire_unclear: false,
    word_count_mismatch: false,
    robotic_or_generic: false,
    other: false
  })
  const [otherText, setOtherText] = useState<string>("")

  const isLowRating = useMemo(() => typeof rating === "number" && rating <= 2, [rating])
  const canSubmit = useMemo(() => typeof rating === "number" && rating >= 1 && rating <= 5, [rating])

  /**
   * Reset internal state when dialog closes.
   */
  function resetState() {
    setIsSubmitting(false)
    setRating(null)
    setHovered(null)
    setReasons({
      questionnaire_unclear: false,
      word_count_mismatch: false,
      robotic_or_generic: false,
      other: false
    })
    setOtherText("")
  }

  /**
   * Close handler. If parent closes the dialog (e.g., pressing Esc), bubble up.
   */
  function handleOpenChange(next: boolean) {
    if (!next) {
      resetState()
    }
    onOpenChange(next)
  }

  /**
   * Submit PATCH to /api/pitches/[pitchId] with rating and optional ratingReason.
   * - ratingReason is null for ratings > 2.
   * - For ratings <= 2, ratingReason is a JSON string: { reasons: LowRatingReasonKey[], otherText?: string }.
   */
  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return
    try {
      setIsSubmitting(true)

      const body: {
        pitchRating: number
        ratingReason: string | null
      } = {
        pitchRating: rating as number,
        ratingReason: isLowRating ? buildRatingReasonPayload(reasons, otherText) : null
      }

      const response = await fetch(`/api/pitches/${pitchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const err = await safeJson(response)
        throw new Error(err?.error || `Request failed with ${response.status}`)
      }

      toast({ title: "Thanks for your feedback." })
      // Navigate back to dashboard as per UX requirement.
      router.push("/dashboard")
    } catch (error: any) {
      console.error("[FeedbackDialog] submit error:", error)
      toast({
        title: "Failed to save feedback",
        description: error?.message || "Please try again."
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What would you rate this pitch?</DialogTitle>

          <DialogDescription>
            Select from 1 to 5 stars. Low ratings will ask for reasons to help improve results.
          </DialogDescription>
        </DialogHeader>

        {/* Rating row */}
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center gap-2"
            role="radiogroup"
            aria-label="Pitch rating from 1 to 5 stars"
          >
            {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => {
              const display = hovered ?? rating ?? 0
              const active = value <= display
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  className="p-1 focus:outline-none"
                  onMouseEnter={() => setHovered(value)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setRating(value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setRating(value)
                    }
                    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                      e.preventDefault()
                      setRating((prev) => Math.min(5, (prev || 0) + 1))
                    }
                    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                      e.preventDefault()
                      setRating((prev) => Math.max(1, (prev || 1) - 1))
                    }
                  }}
                >
                  <Star
                    className={`size-7 transition ${
                      active ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Low-rating conditional follow-up */}
          {isLowRating && (
            <div className="mt-2 flex flex-col gap-3">
              <div className="text-sm font-medium">Help us understand the issue</div>

              <div className="flex flex-col gap-2">
                {(
                  [
                    "questionnaire_unclear",
                    "word_count_mismatch",
                    "robotic_or_generic",
                    "other"
                  ] as LowRatingReasonKey[]
                ).map((key) => (
                  <div key={key} className="flex items-start gap-2">
                    <Checkbox
                      id={key}
                      checked={reasons[key]}
                      onCheckedChange={(checked) =>
                        setReasons((prev) => ({ ...prev, [key]: Boolean(checked) }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm leading-5">
                      {REASON_LABELS[key]}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Other text input */}
              {reasons.other && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="otherText" className="text-sm">Please specify</Label>
                  <Textarea
                    id="otherText"
                    value={otherText}
                    placeholder="Briefly describe the issue"
                    maxLength={2000}
                    onChange={(e) => setOtherText(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground">
                    {otherText.length}/2000
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit feedback"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Safely parse response JSON. Returns undefined if not JSON.
 */
async function safeJson(res: Response): Promise<any | undefined> {
  try {
    return await res.json()
  } catch {
    return undefined
  }
}