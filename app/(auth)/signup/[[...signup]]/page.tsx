/*
This client page provides the signup form from Clerk.
*/

"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"

export default function SignUpPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") || "/"

  return (
    <SignUp
      forceRedirectUrl={redirectUrl}
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  )
}
