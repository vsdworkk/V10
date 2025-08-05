// app/(wizard)/dashboard/new/layout.tsx
"use client"

import { useLayoutEffect, useState, useRef } from "react"
import SectionProgressSidebar from "./components/progress/section-progress-bar"
import MobileProgressHeader from "./components/progress/mobile-progress-header"
import { Section } from "@/types"
import { useRouter } from "next/navigation"
import Link from "next/link"
import NavigationButton from "@/components/navigation-button"

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

  // Ref to track the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Function to handle navigation from sidebar
  const handleSectionNavigate = (section: Section) => {
    // Update current section but don't change max completed
    setCurrentSection(section)

    // Reset scroll position when navigating
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }

    // Notify wizard of navigation request
    const event = new CustomEvent("sectionNavigate", { detail: { section } })
    window.dispatchEvent(event)
  }

  // Listen for section changes from the wizard
  useLayoutEffect(() => {
    const handleSectionChange = (e: any) => {
      if (e.detail && e.detail.section) {
        const newSection = e.detail.section
        const isForwardNavigation = e.detail.isForwardNavigation

        setCurrentSection(newSection)

        // Reset scroll position when moving forward in the wizard
        if (isForwardNavigation && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }

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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Subtle grid-pattern overlay */}
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden">
        <MobileProgressHeader
          current={currentSection}
          maxCompleted={maxCompletedSection}
          onNavigate={handleSectionNavigate}
        />
      </div>

      {/* Desktop Header - Only visible on desktop */}
      <header className="z-10 hidden shrink-0 bg-white shadow-sm lg:block">
        <div className="mx-auto flex w-full max-w-full items-center justify-between p-4 lg:px-12 lg:py-6">
          <div className="flex items-center lg:pl-3">
            <Link href="/">
              <span className="cursor-pointer text-xl font-bold text-black lg:text-2xl">
                APSPitchPro
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main container - Mobile and Desktop layouts */}
      <div className="flex flex-1">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-1 flex-col lg:hidden">
          <div className="flex-1 p-4 pb-20">
            {/* Extra bottom padding for mobile nav */}
            <div className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              <div className="block px-4 pt-2">
                <NavigationButton
                  text="Back to Dashboard"
                  className="text-[#444ec1]"
                />
              </div>

              <div ref={scrollContainerRef} className="h-full overflow-y-auto">
                <div className="px-4 pb-4 pt-3 sm:p-6">{children}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Sidebar + Content */}
        <div className="hidden flex-1 items-center justify-center p-6 lg:flex">
          <div className="flex h-[calc(100vh-140px)] w-[90%] max-w-6xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
            {/* Desktop Sidebar */}
            <div className="w-72 shrink-0 border-r border-gray-100 bg-white shadow-lg">
              <div className="h-full overflow-y-auto p-8">
                <SectionProgressSidebar
                  current={currentSection}
                  maxCompleted={maxCompletedSection}
                  onNavigate={handleSectionNavigate}
                />
              </div>
            </div>

            {/* Desktop Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="ml-10 py-4">
                <NavigationButton
                  text="Back to Dashboard"
                  className="text-[#444ec1]"
                />
              </div>

              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                <div className="px-8 pb-8 pt-5">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
