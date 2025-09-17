import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { Providers } from "@/components/utilities/providers"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

import { Poppins, Playfair_Display } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"

import "./globals.css"
import Script from "next/script"
import Analytics from "@/components/seo/analytics"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap"
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-playfair",
  display: "swap"
})

export const metadata: Metadata = {
  title: "APSPitchPro",
  description: "3X Your Interview Chances With AI-Powered Pitches"
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  if (!GA_ID) {
    console.error("Missing NEXT_PUBLIC_GA_ID environment variable")
  }

  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(poppins.className, playfair.variable)}
      >
        <head>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
          </Script>
        </head>

        <body
          className={cn(
            "bg-background mx-auto min-h-screen w-full scroll-smooth antialiased"
          )}
        >
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}

            <Analytics />
            <TailwindIndicator />
            <Toaster />
            <SonnerToaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
