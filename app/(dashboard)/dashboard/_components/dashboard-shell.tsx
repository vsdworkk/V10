"use client"

import DashboardSidebar from "./dashboard-sidebar"
import DashboardMobileNav from "./dashboard-mobile-nav"

interface DashboardShellProps {
  children: React.ReactNode
  hasStripeCustomerId: boolean
}

export default function DashboardShell({
  children,
  hasStripeCustomerId
}: DashboardShellProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <DashboardMobileNav hasStripeCustomerId={hasStripeCustomerId} />
      <aside className="hidden md:block">
        <DashboardSidebar hasStripeCustomerId={hasStripeCustomerId} />
      </aside>
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-white shadow-sm md:m-4 md:rounded-lg">
        {children}
      </main>
    </div>
  )
}
