"use client"

import React from "react"

export default function WizardIntroStep() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm min-h-96 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          Welcome to the Pitch Wizard
        </h2>
        
        <p className="text-lg text-gray-700">
          To get the best results feel free to refer to our{" "}
          <a
            href="/blog/how-to-use-apspitchpro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            guide
          </a>{" "}
          during the wizard.
        </p>
      </div>
    </div>
  )
}
