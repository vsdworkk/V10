// app/(wizard)/dashboard/new/layout.tsx
"use client"

import { useEffect, useState, useRef } from "react"
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
 useEffect(() => {
   const handleSectionChange = (e: any) => {
     if (e.detail && e.detail.section) {
       const newSection = e.detail.section;
       const isForwardNavigation = e.detail.isForwardNavigation;
       
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
   return () => window.removeEventListener("sectionChange", handleSectionChange)
 }, [maxCompletedSection])

 return (
   <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
     {/* Subtle grid-pattern overlay */}
     <div
       className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
       style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
       }}
     />

     {/* Header - Fixed height */}
     <header id="header" className="bg-white shadow-sm flex-shrink-0 z-10">
       <div className="max-w-full w-full px-12 mx-auto flex items-center justify-between py-6">
         {/* Logo positioned with padding from the left edge */}
         <div className="flex items-center pl-3">
           <span className="text-2xl font-bold text-black">
             APSPitchPro
           </span>
         </div>
       </div>
     </header>
     
     {/* Main container - Takes remaining height */}
     <div id="main-container" className="flex-1 flex items-center justify-center p-6 min-h-0">
       <div
         id="application-card"
         className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-[90%] max-w-6xl h-[calc(100vh-140px)] flex"
       >
         {/* Sidebar with vertical progress - Fixed width */}
         <div
           id="sidebar"
           className="w-72 border-r border-gray-100 bg-white flex-shrink-0 shadow-lg"
         >
           <div className="h-full overflow-y-auto p-8">
             <SectionProgressSidebar 
               current={currentSection}
               maxCompleted={maxCompletedSection}
               onNavigate={handleSectionNavigate}
             />
           </div>
         </div>

         {/* Main content area - Takes remaining space with internal scrolling */}
         <div id="main-content" className="flex-1 flex flex-col min-w-0">
           <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
             <div className="p-8">
               {children}
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}