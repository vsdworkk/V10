import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { Providers } from "@/components/utilities/providers"
import { Toaster } from "@/components/ui/toaster"

import { Poppins, Playfair_Display } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"

import "./globals.css"

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

  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(poppins.className, playfair.variable)}
      >
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

            <TailwindIndicator />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
