/**
 * @file lib/authz.ts
 * @description
 * Server-only admin authorization helpers using Clerk. Provides:
 *  - getAdminEmails(): parse ADMIN_EMAILS from env
 *  - isAdmin(): boolean check for the current user
 *  - requireAdmin(): guard that redirects non-admins to /dashboard
 *
 * Usage:
 *  - Import in **server components** or **server actions** only.
 *  - Example:
 *      const userId = await requireAdmin(); // redirects if not allowed
 *
 * Env:
 *  - ADMIN_EMAILS: Comma-separated list of admin emails.
 *
 * Notes:
 *  - This file is annotated with "use server" to ensure it is never bundled
 *    for the client. Do not import from client components.
 *  - If ADMIN_EMAILS is unset or empty, no users are admins.
 */

"use server"

import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

/**
 * Parse ADMIN_EMAILS from environment into a lowercase Set for O(1) membership checks.
 * Empty or missing env yields an empty Set (no admins).
 */
export async function getAdminEmails(): Promise<Set<string>> {
  const raw = process.env.ADMIN_EMAILS || ""
  return new Set(
    raw
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * Extract all known emails from a Clerk user. Defensive against undefined shapes.
 * @param u - The Clerk user object returned by `currentUser()`
 * @returns list of lowercased email strings
 */
function emailsFromUser(u: any): string[] {
  const emails: string[] = []

  if (u?.emailAddresses && Array.isArray(u.emailAddresses)) {
    for (const e of u.emailAddresses) {
      const addr = e?.emailAddress
      if (typeof addr === "string" && addr.length > 0) {
        emails.push(addr.toLowerCase())
      }
    }
  }

  // Ensure primary email is included even if not present in the above iteration order
  const primary = u?.primaryEmailAddress?.emailAddress
  if (typeof primary === "string") {
    const lc = primary.toLowerCase()
    if (!emails.includes(lc)) emails.push(lc)
  }

  return emails
}

/**
 * Check if the current user is an admin according to ADMIN_EMAILS.
 * @returns Promise<boolean> - true if the user is allowed
 *
 * Error handling:
 *  - Returns false if unauthenticated or ADMIN_EMAILS not set.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false
  const allow = await getAdminEmails()
  const userEmails = emailsFromUser(user)
  return userEmails.some(e => allow.has(e))
}

/**
 * Require admin access. If the current user is not an admin, redirect to `/dashboard`.
 * @returns Promise<string> - the Clerk userId if authorized (guards often need it)
 *
 * Redirect behavior:
 *  - Unauthenticated users or non-admins are redirected to `/dashboard`.
 *  - Redirection uses Next.js `redirect()` which throws internally.
 */
export async function requireAdmin(): Promise<string> {
  const user = await currentUser()
  if (!user) redirect("/dashboard")

  const allow = await getAdminEmails()
  const userEmails = emailsFromUser(user)
  const allowed = userEmails.some(e => allow.has(e))
  if (!allowed) redirect("/dashboard")

  return user!.id
}
