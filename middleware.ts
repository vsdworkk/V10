/*
Contains middleware for protecting routes, checking user authentication, and redirecting as needed.
*/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Create a matcher for protected routes
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/todo(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // If the user isn't signed in and the route is protected, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Allow all other requests to proceed
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip all static files
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
    // But include API routes
    "/(api|trpc)(.*)",
  ]
}
