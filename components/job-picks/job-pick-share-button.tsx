/**
 * @file components/job-picks/job-pick-share-button.tsx
 * @description
 * Share button component that generates shareable links to specific job picks
 * and copies them to the clipboard with user feedback.
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { toast } from "sonner"
import type { SelectJobPick } from "@/types"

interface JobPickShareButtonProps {
  job: SelectJobPick
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function JobPickShareButton({
  job,
  variant = "outline",
  size = "default",
  className
}: JobPickShareButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false)

  const generateShareURL = React.useCallback(() => {
    const baseURL = typeof window !== "undefined" ? window.location.origin : ""
    const jobPicksPath = "/job-picks"
    return `${baseURL}${jobPicksPath}?job=${encodeURIComponent(job.id)}`
  }, [job.id])

  const handleShare = React.useCallback(async () => {
    const shareURL = generateShareURL()

    try {
      if (navigator.share) {
        // Use native share API if available (mobile devices)
        await navigator.share({
          title: `${job.title} - ${job.agency}`,
          text: `Check out this APS job: ${job.title} at ${job.agency}`,
          url: shareURL
        })
        toast.success("Shared successfully!")
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareURL)
        setIsCopied(true)
        toast.success("Link copied to clipboard!")

        // Reset copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback for older browsers or clipboard API failures
      try {
        const textArea = document.createElement("textarea")
        textArea.value = shareURL
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)

        setIsCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setIsCopied(false), 2000)
      } catch (fallbackError) {
        toast.error("Failed to copy link. Please copy manually.")
      }
    }
  }, [generateShareURL, job.title, job.agency])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      aria-label={`Share ${job.title} job`}
    >
      {isCopied ? (
        <>
          <Check className="mr-2 size-4" />
          {size !== "icon" && "Copied!"}
        </>
      ) : (
        <>
          <Share2 className="mr-2 size-4" />
          {size !== "icon" && "Share"}
        </>
      )}
    </Button>
  )
}
