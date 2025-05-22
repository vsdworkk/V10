/*
This client page provides the login form from Clerk.
*/

"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") || "/"

  return (
    <SignIn
      forceRedirectUrl={redirectUrl}
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  )
}
