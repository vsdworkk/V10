"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
import DashboardSidebar from "./dashboard-sidebar"

interface DashboardMobileNavProps {
  hasStripeCustomerId: boolean
}

export default function DashboardMobileNav({
  hasStripeCustomerId
}: DashboardMobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button
          aria-label="Open menu"
          className="p-2"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Pitch Manager</h1>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white shadow-lg">
            <div className="flex justify-end p-4">
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <DashboardSidebar
              hasStripeCustomerId={hasStripeCustomerId}
              onLinkClick={() => setOpen(false)}
            />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
