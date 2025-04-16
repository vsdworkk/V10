"use client"

import React from "react"

export default function WizardIntroStep() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-sm border space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 text-center">
        How This Wizard Works
      </h1>

      <section className="space-y-4 text-gray-700">
        <p>
          Applying for a public service job involves writing a <strong>"pitch"</strong> or <strong>"statement of claims"</strong>. These are written statements demonstrating your suitability for the role by aligning your experience to the Integrated Leadership System (ILS) and Work Level Standards (WLS).
        </p>

        <p>
          <strong>The good news:</strong> You don't need to worry about explicitly aligning your responses to the ILS and WLS. Our wizard is specifically designed to ask intuitive questions that capture all the details required. This information is then used to create a professional-grade pitch that aligns perfectly with the role and required standards.
        </p>

        <p>
          Here's how the process will unfold:
        </p>

        <ul className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Role Details:</strong> Basic information about the position you're applying for.
          </li>
          <li>
            <strong>Your Experience:</strong> Details about your relevant experience.
          </li>
          <li>
            <strong>Guidance (Beta):</strong> Our AI assistant will analyze your provided experiences and suggest areas that can be effectively structured into STAR examples.
          </li>
          <li>
            <strong>STAR Examples:</strong> Structured questions to help you articulate your experiences clearly and effectively.
          </li>
        </ul>

        <p>
          The <strong>STAR method</strong> is widely recognized as the most effective way to structure examples in your pitch. STAR consists of four key components:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Situation:</strong> Briefly describe the context or challenge, including where and when it happened.
          </li>
          <li>
            <strong>Task:</strong> Outline your specific responsibilities or objectives in that situation.
          </li>
          <li>
            <strong>Action:</strong> Explain the key steps or actions you took, highlighting your skills and methods.
          </li>
          <li>
            <strong>Result:</strong> Share the outcomes or achievements resulting from your actions, emphasizing their impact.
          </li>
        </ul>

        <p>
          As you complete each step, don't stress over grammar or perfect wording—just provide clear, detailed descriptions of your experiences. Our wizard, supported by our AI assistant Albert, will handle the fine-tuning and professional phrasing for you.
        </p>

        <p>
          By the end of this wizard, you'll have a polished, professional-quality pitch ready for submission.
        </p>
      </section>

      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm">
          Click <strong>Next</strong> when you're ready to get started.
        </p>
      </div>
    </div>
  )
}