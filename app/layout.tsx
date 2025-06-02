/*
The root server layout for the app.
*/

import {
  createProfileAction,
  getProfileByUserIdAction
} from "@/actions/db/profiles-actions"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import { getCachedProfile } from "@/lib/profile-cache"
import { cacheProfileAction } from "@/actions/profile-cache-actions"
import type { SelectProfile } from "@/db/schema"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Receipt AI",
  description: "A full-stack web app template."
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  let initialProfile: SelectProfile | null = null

  if (userId) {
    initialProfile = await getCachedProfile(userId)
    if (!initialProfile) {
      const profileRes = await getProfileByUserIdAction(userId)
      if (profileRes.isSuccess && profileRes.data) {
        initialProfile = profileRes.data
      } else {
        const created = await createProfileAction({ userId })
        if (created.isSuccess) {
          initialProfile = created.data
        }
      }
      if (initialProfile) {
        await cacheProfileAction(initialProfile)
      }
    }
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
            initialProfile={initialProfile}
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
