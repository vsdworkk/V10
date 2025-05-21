// app/(wizard)/dashboard/new/layout.tsx
"use client"

import { useEffect, useState } from "react"
import SectionProgressSidebar from "./_components/section-progress-bar"
import { Section } from "@/types"
import { useRouter } from "next/navigation"

interface PitchWizardLayoutProps {
  children: React.ReactNode
}

// Define section order for comparison
const SECTION_ORDER: Section[] = [
  "INTRO",
  "ROLE",
  "EXP",
  "GUIDE",
  "STAR",
  "FINAL"
]

export default function PitchWizardLayout({
  children
}: PitchWizardLayoutProps) {
  const [currentSection, setCurrentSection] = useState<Section>("INTRO")
  const [maxCompletedSection, setMaxCompletedSection] =
    useState<Section>("INTRO")
  const router = useRouter()

  // Function to handle navigation from sidebar
  const handleSectionNavigate = (section: Section) => {
    // Update current section but don't change max completed
    setCurrentSection(section)

    // Notify wizard of navigation request
    const event = new CustomEvent("sectionNavigate", { detail: { section } })
    window.dispatchEvent(event)
  }

  // Listen for section changes from the wizard
  useEffect(() => {
    const handleSectionChange = (e: any) => {
      if (e.detail && e.detail.section) {
        const newSection = e.detail.section
        setCurrentSection(newSection)

        // Update max completed section if advancing forward
        const currentIndex = SECTION_ORDER.indexOf(newSection)
        const maxIndex = SECTION_ORDER.indexOf(maxCompletedSection)

        if (currentIndex > maxIndex) {
          setMaxCompletedSection(newSection)
        }
      }
    }

    window.addEventListener("sectionChange", handleSectionChange)
    return () =>
      window.removeEventListener("sectionChange", handleSectionChange)
  }, [maxCompletedSection])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Subtle grid-pattern overlay */}
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header - Updated to position logo far left and image far right */}
      <header id="header" className="bg-white p-6 shadow-sm">
        <div className="mx-auto flex w-full max-w-full items-center justify-between px-12">
          {/* Logo positioned with padding from the left edge */}
          <div className="flex items-center pl-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-600">
              <i className="fa-solid fa-briefcase text-white"></i>
            </div>
            <span className="ml-2 text-2xl font-bold text-blue-600">
              JobFlow
            </span>
          </div>
        </div>
      </header>

      {/* Main "application card" container */}
      <div
        id="main-container"
        className="flex items-stretch justify-center p-12"
      >
        <div
          id="application-card"
          className="flex w-[90%] max-w-6xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
        >
          {/* Sidebar with vertical progress */}
          <div
            id="sidebar"
            className="flex w-72 items-center border-r border-gray-100 bg-white p-8 shadow-lg"
          >
            <SectionProgressSidebar
              current={currentSection}
              maxCompleted={maxCompletedSection}
              onNavigate={handleSectionNavigate}
            />
          </div>

          {/* Your wizard content */}
          <section
            id="main-content"
            className="h-[800px] flex-1 overflow-y-auto p-5"
          >
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}
