/*
This server layout provides a shared header and basic structure for (marketing) routes.
*/

"use server"

import Header from "@/components/landing/header"

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white relative">
      <Header />
      <div className="flex-1 relative z-10">{children}</div>
    </div>
  )
}