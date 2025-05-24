/*
This server layout provides a shared header and basic structure for (marketing) routes.
*/

"use server"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
