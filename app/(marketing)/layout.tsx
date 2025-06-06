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
    <div className="relative flex min-h-screen flex-col bg-white">
      <Header />
      <div className="relative z-10 flex-1">{children}</div>
    </div>
  )
}
