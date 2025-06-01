/*
Handles Stripe webhook events to add credits to user profiles when a
payment link checkout session completes.
*/

import { addCreditsAction } from "@/actions/db/profiles-actions"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import Stripe from "stripe"

const relevantEvents = new Set(["checkout.session.completed"])

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get("Stripe-Signature") as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      throw new Error("Webhook secret or signature missing")
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutSession(event)
          break
        default:
          throw new Error("Unhandled relevant event!")
      }
    } catch (error) {
      console.error("Webhook handler failed:", error)
      return new Response(
        "Webhook handler failed. View your nextjs function logs.",
        { status: 400 }
      )
    }
  }

  return new Response(JSON.stringify({ received: true }))
}

async function handleCheckoutSession(event: Stripe.Event) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session
  if (checkoutSession.mode === "payment") {
    const session = await stripe.checkout.sessions.retrieve(
      checkoutSession.id,
      {
        expand: ["line_items.data.price.product"]
      }
    )
    const lineItem = session.line_items?.data[0]
    const product = lineItem?.price?.product as Stripe.Product | undefined
    const productId = typeof product === "string" ? product : product?.id
    const clientRef = checkoutSession.client_reference_id as string

    if (!productId || !clientRef) return

    const fullProduct =
      typeof product === "string"
        ? await stripe.products.retrieve(productId)
        : (product as Stripe.Product)
    const credits = parseInt(fullProduct.metadata.credits || "0", 10)
    if (credits > 0) {
      await addCreditsAction(clientRef, credits)
    }
  }
}
