"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"

export default function MobileHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-gray-200 bg-white p-4 md:hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="size-8 p-0"
        >
          <Menu className="size-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">Pitch Manager</h1>
      </div>
      
      <div className="flex items-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8"
            }
          }}
        />
      </div>
    </header>
  )
}
