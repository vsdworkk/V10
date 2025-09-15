"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface WizardIntroStepProps {
  onBackToDashboard?: () => void
}

export default function WizardIntroStep({
  onBackToDashboard
}: WizardIntroStepProps) {
  return (
    <div className="relative">
      {/* Back to Dashboard button - positioned in top left */}
      {onBackToDashboard && (
        <div className="absolute left-0 top-0 z-10">
          <Button
            variant="ghost"
            onClick={onBackToDashboard}
            className="group flex items-center px-3 py-2 font-normal text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-800"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto flex min-h-96 max-w-3xl items-center justify-center rounded-xl bg-white p-8 shadow-sm">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Welcome to the Pitch Wizard
          </h2>

          <p className="text-lg text-gray-700">
            To get the best results feel free to refer to our{" "}
            <a
              href="/blog/how-to-use-apspitchpro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              guide
            </a>{" "}
            during the wizard.
          </p>
        </div>
      </div>
    </div>
  )
}
