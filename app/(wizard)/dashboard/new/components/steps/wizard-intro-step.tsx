"use client"

import Link from "next/link"

export default function WizardIntroStep() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-center text-lg">
        Welcome to the PitchWizard. To get the best results, please read our{" "}
        <Link
          href="/blog/how-to-use-apspitchpro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          guide
        </Link>
        .
      </p>
    </div>
  )
}
