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
    <>
      <link
        rel="preload"
        as="image"
        href="/hero-placeholder-image.png"
        imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
      <div className="relative flex min-h-screen flex-col bg-white">
        <Header />
        <div className="relative z-10 flex-1">{children}</div>
      </div>
    </>
  )
}
