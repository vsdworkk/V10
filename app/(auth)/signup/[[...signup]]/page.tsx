/*
This client page provides the signup form from Clerk.
*/

"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SignUpPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()

  const [redirectUrl, setRedirectUrl] = useState("/dashboard")

  useEffect(() => {
    const param = searchParams.get("redirect_url")
    const stored = localStorage.getItem("afterSignUpRedirect")

    if (param) {
      setRedirectUrl(param)
    } else if (stored) {
      setRedirectUrl(stored)
      localStorage.removeItem("afterSignUpRedirect")
    }
  }, [searchParams])

  return (
    <SignUp
      forceRedirectUrl={redirectUrl}
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  )
}
