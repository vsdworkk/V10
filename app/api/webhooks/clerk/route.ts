/*
Clerk webhook handler for automatic profile creation when users sign up.
This eliminates race conditions by creating profiles immediately after Clerk user creation.
*/

import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable")
    return new NextResponse("Internal server error", { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing required svix headers")
    return new NextResponse("Error occurred -- no svix headers", {
      status: 400
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new NextResponse("Error occurred -- verification failed", {
      status: 400
    })
  }

  // Handle the webhook event
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Received webhook: ${eventType} for user: ${id}`)

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt)
        break
      case "user.updated":
        await handleUserUpdated(evt)
        break
      case "user.deleted":
        await handleUserDeleted(evt)
        break
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    return new NextResponse("Webhook processed successfully", { status: 200 })
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error)
    return new NextResponse("Error processing webhook", { status: 500 })
  }
}

/**
 * Handle user creation - create profile in Supabase
 */
async function handleUserCreated(evt: WebhookEvent) {
  const { id: userId } = evt.data

  if (!userId) {
    throw new Error("No user ID found in webhook data")
  }

  try {
    // Check if profile already exists (idempotency check)
    const existingProfile = await db.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId)
    })

    if (existingProfile) {
      console.log(`Profile already exists for user: ${userId}`)
      return
    }

    // Create new profile with default values
    const newProfile = await db
      .insert(profilesTable)
      .values({
        userId: userId,
        membership: "free",
        credits: 2,
        creditsUsed: 0
      })
      .returning()

    console.log(`Successfully created profile for user: ${userId}`, {
      profileId: newProfile[0].userId,
      membership: newProfile[0].membership,
      credits: newProfile[0].credits
    })
  } catch (error) {
    console.error(`Failed to create profile for user ${userId}:`, error)
    throw error
  }
}

/**
 * Handle user updates - sync any relevant changes
 */
async function handleUserUpdated(evt: WebhookEvent) {
  const { id: userId } = evt.data

  if (!userId) {
    throw new Error("No user ID found in webhook data")
  }

  try {
    await db
      .update(profilesTable)
      .set({
        updatedAt: new Date()
      })
      .where(eq(profilesTable.userId, userId))

    console.log(`Successfully updated profile sync for user: ${userId}`)
  } catch (error) {
    console.error(`Failed to update profile for user ${userId}:`, error)
    throw error
  }
}

/**
 * Handle user deletion - clean up profile data
 */
async function handleUserDeleted(evt: WebhookEvent) {
  const { id: userId } = evt.data

  if (!userId) {
    throw new Error("No user ID found in webhook data")
  }

  try {
    const deletedProfile = await db
      .delete(profilesTable)
      .where(eq(profilesTable.userId, userId))
      .returning()

    if (deletedProfile.length > 0) {
      console.log(`Successfully deleted profile for user: ${userId}`)
    } else {
      console.log(`No profile found to delete for user: ${userId}`)
    }
  } catch (error) {
    console.error(`Failed to delete profile for user ${userId}:`, error)
    throw error
  }
}
