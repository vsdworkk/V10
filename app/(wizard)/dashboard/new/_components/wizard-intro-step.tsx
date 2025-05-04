"use client"

import React from "react"

export default function WizardIntroStep() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-sm">
      {/* Main Content */}
      <div className="text-center mb-10">
        <div className="w-20 h-1 bg-blue-500 mx-auto mb-6"></div>
        <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed text-justify">
          Crafting a public service pitch or statement of claims no longer needs to be a headache. Simply answer a few easy questions, and our AI assistant, trained on thousands of professional-grade pitches, will transform your responses into a professional grade pitch that's perfectly aligned with job competencies, the Integrated Leadership System (ILS), and Work Level Standards (WLS).
        </p>
      </div>

      {/* Stacked Sections */}
      <div className="mb-10 space-y-6">
        {/* What you'll do */}
        <div className="flex items-start p-4">
          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3 mt-0.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">What you'll do</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Complete a short wizard with simple guided questions</li>
              <li>Share information about your target role and experience</li>
              <li>Review and refine your generated pitch as needed</li>
            </ul>
          </div>
        </div>

        {/* What we'll do */}
        <div className="flex items-start p-4">
          <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">What we'll do</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Transform your responses into a professional grade pitch</li>
              <li>Ensure alignment with job requirements, ILS, and WLS standards</li>
              <li>Deliver a standout application that impresses recruiters</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips & Guidance Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
        <div className="flex items-start">
          <div className="mr-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
          </div>
          <div>
            <p className="text-blue-800 text-sm">
              Be specific and detailed in your answers. The quality of information matters more than perfect wording. Our AI will handle the polish!
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to action */}
      <div className="text-center">
        <p className="text-gray-700">
          Click <strong>Next</strong> to begin. Your next career move has never been simpler.
        </p>
      </div>

    </div>
  )
}