"use client"

import { useState } from "react"
import CheckStoredPitch from "../utilities/check-stored-pitch"
import PitchWizard from "."

export default function PitchWizardWrapper({
  userId,
  initialStep
}: {
  userId: string
  initialStep: number
}) {
  const [ready, setReady] = useState(false)

  return (
    <>
      <CheckStoredPitch onReady={() => setReady(true)} />
      {ready ? (
        <PitchWizard userId={userId} initialStep={initialStep} />
      ) : (
        <div className="flex size-full min-h-[500px] flex-col items-center justify-center">
          <svg
            className="mb-4 size-12 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="text-lg text-gray-700">Preparing your pitch...</p>
        </div>
      )}
    </>
  )
}
