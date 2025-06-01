"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export default function MobileHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 relative z-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">Pitch Manager</h1>
      </div>
    </header>
  )
} 