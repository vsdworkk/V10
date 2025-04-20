"use client"

import React from "react"

export default function WizardIntroStep() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {/* Intro Paragraph */}
      <p className="text-gray-700 max-w-2xl">
        Crafting a public service pitch or statement of claims no longer needs to be a headache. Simply answer a few straightforward questions and <span className="font-semibold">Albert</span>, our AI assistant trained on thousands of professional-grade pitches, will shape your responses into a polished, professional pitch fully aligned with the key job competencies, Integrated Leadership System (ILS), and Work Level Standards (WLS).
      </p>

      {/* Horizontal Flow Chart */}
      <div className="flex flex-col items-center">
        <div className="flex flex-row justify-center items-center gap-4 w-full max-w-2xl">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg shadow">
              1
            </div>
            <span className="mt-2 text-sm text-gray-700 font-medium text-center">Role Details</span>
          </div>
          
          {/* Arrow 1 */}
          <div className="flex items-center justify-center w-6 h-6 mb-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg shadow">
              2
            </div>
            <span className="mt-2 text-sm text-gray-700 font-medium text-center">Your Experience</span>
          </div>
          
          {/* Arrow 2 */}
          <div className="flex items-center justify-center w-6 h-6 mb-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg shadow">
              3
            </div>
            <span className="mt-2 text-sm text-gray-700 font-medium text-center">Guidance (Beta)</span>
          </div>
          
          {/* Arrow 3 */}
          <div className="flex items-center justify-center w-6 h-6 mb-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg shadow">
              4
            </div>
            <span className="mt-2 text-sm text-gray-700 font-medium text-center">STAR Examples</span>
          </div>
          
          {/* Arrow 4 */}
          <div className="flex items-center justify-center w-6 h-6 mb-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          
          {/* Step 5 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg shadow">
              5
            </div>
            <span className="mt-2 text-sm text-gray-700 font-medium text-center">Finalise & Review</span>
          </div>
        </div>
      </div>

      {/* What you'll do */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">What you'll do</h2>
        <ol className="list-decimal pl-6 space-y-1 text-gray-700">
          <li><span className="font-medium">Role Details:</span> Provide details about the job you're targeting.</li>
          <li><span className="font-medium">Your Experience:</span> Share examples that highlight your strengths and achievements.</li>
          <li><span className="font-medium">Guidance (Beta):</span> Albert will analyse your experience against the job description and suggest relevant STAR examples you can choose to use.</li>
          <li><span className="font-medium">STAR Examples:</span> We'll guide you through structured questions to clearly articulate your STAR examples.</li>
          <li><span className="font-medium">Finalise & Review:</span> Review your completed, ready-to-submit professional pitch and make any final adjustments.</li>
        </ol>
      </div>

      {/* What we'll do */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">What we'll do</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>Take care of grammar, tone, and alignment with competencies and frameworks.</li>
          <li>Keep your information secure and easily editable at any time.</li>
        </ul>
      </div>

      {/* Tip Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-900 text-sm">
        <span className="font-semibold">Tip:</span> Provide detailed and specific answers. Clear information matters more than perfect wording.
      </div>

      {/* Closing Line */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm">
          When you're ready, click <span className="font-semibold">Next</span> to begin. Your next career move is just a few simple steps away.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mt-2" />
    </div>
  )
}