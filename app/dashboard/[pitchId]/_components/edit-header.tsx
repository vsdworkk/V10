"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

export default function EditHeader() {
  const [activeSection, setActiveSection] = useState<string>("role")
  
  // Get form context safely, but don't try to use it directly
  const formContext = useFormContext()
  const hasFormContext = !!formContext
  
  // Watch for scroll position to update the active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('h2.text-lg.font-semibold')
      let currentSection = "role"
      
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top
        
        if (sectionTop < 200) {
          currentSection = section.textContent?.toLowerCase() || "role"
        }
      })
      
      setActiveSection(currentSection)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">Edit Pitch</h1>
      <p className="text-muted-foreground mt-2">
        Review and update your pitch details below.
      </p>
      
      <div className="flex gap-2 mt-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${activeSection === "role details" ? "bg-primary text-white" : "bg-muted"}`}>
          Role Details
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${activeSection === "experience" ? "bg-primary text-white" : "bg-muted"}`}>
          Experience
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${activeSection === "star examples" ? "bg-primary text-white" : "bg-muted"}`}>
          STAR Examples
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${activeSection === "final pitch content" ? "bg-primary text-white" : "bg-muted"}`}>
          Final Pitch
        </div>
      </div>
    </div>
  )
} 