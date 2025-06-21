/*
The root server layout for the app.
*/

import { ensureProfileAction } from "@/actions/db/profiles-actions"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import "./globals.css"

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

  if (userId) {
    await ensureProfileAction(userId)
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://rsms.me/" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
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

            <TailwindIndicator />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
