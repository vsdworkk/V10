import { WebhookEvent } from "@clerk/nextjs/server"
import { profilesTable } from "@/db/schema"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { Webhook } from "svix"
import { db } from "@/db/db"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable")
    return new NextResponse("Internal server error", { status: 500 })
  }

  const svix_id = req.headers.get("svix-id")
  const svix_timestamp = req.headers.get("svix-timestamp")
  const svix_signature = req.headers.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.warn("Missing required Svix headers")
    return new NextResponse("Missing Svix headers", { status: 400 })
  }

  const payload = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature
    }) as WebhookEvent
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new NextResponse("Webhook verification failed", { status: 400 })
  }

  const { id: userId } = evt.data ?? {}
  const eventType = evt.type

  if (!userId) {
    console.warn("No user ID in webhook payload")
    return new NextResponse("No user ID in payload", { status: 400 })
  }

  console.log(`Received webhook: ${eventType} for user: ${userId}`)

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(userId)
        break
      case "user.updated":
        await handleUserUpdated(userId)
        break
      case "user.deleted":
        await handleUserDeleted(userId)
        break
      default:
        console.info(`Unhandled webhook event type: ${eventType}`)
    }

    return new NextResponse("Webhook processed successfully", { status: 200 })
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error)
    return new NextResponse("Error processing webhook", { status: 500 })
  }
}

async function handleUserCreated(userId: string) {
  const existingProfile = await db.query.profiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.userId, userId)
  })

  if (existingProfile) {
    console.info(`Profile already exists for user: ${userId}`)
    return
  }

  const [newProfile] = await db
    .insert(profilesTable)
    .values({
      userId,
      membership: "free",
      credits: 2,
      creditsUsed: 0
    })
    .returning()

  console.log("Profile created:", {
    userId: newProfile.userId,
    membership: newProfile.membership,
    credits: newProfile.credits
  })
}

async function handleUserUpdated(userId: string) {
  await db
    .update(profilesTable)
    .set({ updatedAt: new Date() })
    .where(eq(profilesTable.userId, userId))

  console.log(`Profile updated for user: ${userId}`)
}

async function handleUserDeleted(userId: string) {
  const deleted = await db
    .delete(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .returning()

  if (deleted.length > 0) {
    console.log(`Deleted profile for user: ${userId}`)
  } else {
    console.info(`No profile found for deletion: ${userId}`)
  }
}
