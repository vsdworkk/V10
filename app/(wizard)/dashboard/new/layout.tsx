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
 children,
}: PitchWizardLayoutProps) {
 const [currentSection, setCurrentSection] = useState<Section>("INTRO")
 const [maxCompletedSection, setMaxCompletedSection] = useState<Section>("INTRO")
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
       const newSection = e.detail.section;
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
   return () => window.removeEventListener("sectionChange", handleSectionChange)
 }, [maxCompletedSection])

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
     {/* Subtle grid-pattern overlay */}
     <div
       className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
       style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
       }}
     />

     {/* Header - Updated to position logo far left and image far right */}
    <header id="header" className="bg-white p-6 shadow-sm w-full">
      <div className="max-w-full w-full px-4 md:px-12 mx-auto flex items-center justify-between">
         {/* Logo positioned with padding from the left edge */}
         <div className="flex items-center pl-3">
           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
             <i className="fa-solid fa-briefcase text-white"></i>
           </div>
           <span className="ml-2 text-2xl font-bold text-blue-600">
             JobFlow
           </span>
         </div>
       </div>
     </header>
     
     {/* Main "application card" container */}
    <div id="main-container" className="flex-1 flex items-center justify-center p-6 md:p-12 w-full">
       <div
         id="application-card"
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl mx-auto flex flex-col md:flex-row"
       >
         {/* Sidebar with vertical progress */}
         <div
           id="sidebar"
        className="w-full md:w-1/3 flex-shrink-0 mb-6 md:mb-0 md:mr-8 border-b md:border-b-0 md:border-r border-gray-100 bg-white p-8 flex items-center shadow-lg"
         >
           <SectionProgressSidebar 
             current={currentSection}
             maxCompleted={maxCompletedSection}
             onNavigate={handleSectionNavigate}
           />
         </div>

         {/* Your wizard content */}
        <section id="main-content" className="flex-1 p-5 sm:p-8 overflow-y-auto">
           {children}
         </section>
       </div>
     </div>
   </div>
 )
}