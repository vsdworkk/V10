"use client"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID
    if (!GA_ID) return
    ;(window as any).gtag?.("config", GA_ID, {
      page_path: pathname + searchParams.toString()
    })
  }, [pathname, searchParams])

  return null
}
