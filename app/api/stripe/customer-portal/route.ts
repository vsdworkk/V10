/**
 * @description
 * API route to create a Stripe customer portal session and redirect the user.
 * This endpoint creates a session and redirects the user to the Stripe customer portal.
 */

import { createCustomerPortalSessionAction } from "@/actions/stripe-actions"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Set cache control headers to prevent caching of this API route
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    // Get the user ID from Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the return URL from the request body or use the default
    const { returnUrl } = await req.json().catch(() => ({}))
    const defaultReturnUrl = new URL("/dashboard", req.url).toString()

    // Create a customer portal session
    const result = await createCustomerPortalSessionAction(
      userId,
      returnUrl || defaultReturnUrl
    )

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    // Return the URL to redirect to
    return NextResponse.json({ url: result.data.url })
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    )
  }
}
