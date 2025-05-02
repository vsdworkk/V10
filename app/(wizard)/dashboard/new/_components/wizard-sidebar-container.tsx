// app/(wizard)/dashboard/new/_components/wizard-sidebar-container.tsx
"use client"

import SectionProgressSidebar from "./section-progress-bar"
import { Section } from "@/types"
import { usePathname, useRouter } from "next/navigation"

interface WizardSidebarContainerProps {
  currentSection: Section
  onNavigate: (section: Section) => void
}

export default function WizardSidebarContainer({ 
  currentSection, 
  onNavigate 
}: WizardSidebarContainerProps) {
  return (
    <div id="sidebar" className="w-72 border-r border-gray-100 bg-white p-8 flex items-center shadow-lg">
      <SectionProgressSidebar 
        current={currentSection} 
        onNavigate={onNavigate} 
      />
    </div>
  )
}