"use client"

import React from "react"

export default function WizardIntroStep() {
  return (
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
  )
}
