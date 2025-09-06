/*
This layout provides a shared header and basic structure for (marketing) routes.
*/

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
        as="video"
        href="/hero-demo-video.mp4"
        type="video/mp4"
      />
      <div className="relative flex min-h-screen flex-col bg-white">
        <Header />
        <div className="relative z-10 flex-1">{children}</div>
      </div>
    </>
  )
}
