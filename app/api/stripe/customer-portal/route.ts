/**
 * @description
 * API route to create a Stripe customer portal session and return the session URL.
 */

import { createCustomerPortalSessionAction } from "@/actions/stripe-actions"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Disable caching for this route
export const dynamic = "force-dynamic"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not defined")
}

const allowedHost = new URL(APP_URL).hostname

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await safeJsonParse(req)
    const rawReturnUrl = body?.returnUrl

    const returnUrl = isValidReturnUrl(rawReturnUrl, req.url)
      ? rawReturnUrl
      : new URL("/dashboard", APP_URL).toString()

    const result = await createCustomerPortalSessionAction(userId, returnUrl)

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ url: result.data.url })
  } catch (error) {
    console.error("Stripe portal session error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

async function safeJsonParse(req: NextRequest): Promise<any | null> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

function isValidReturnUrl(url: string | undefined, baseUrl: string): boolean {
  if (!url || typeof url !== "string") return false

  try {
    const parsed = new URL(url, baseUrl)

    if (parsed.origin === "null") {
      // Relative URLs are safe
      return true
    }

    return parsed.hostname === allowedHost
  } catch {
    return false
  }
}
