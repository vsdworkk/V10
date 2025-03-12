/*
Contains server actions related to Stripe.
*/

import {
  updateProfileAction,
  updateProfileByStripeCustomerIdAction,
  getProfileByUserIdAction
} from "@/actions/db/profiles-actions"
import { SelectProfile } from "@/db/schema"
import { stripe } from "@/lib/stripe"
import { ActionState } from "@/types"
import Stripe from "stripe"

type MembershipStatus = SelectProfile["membership"]

const getMembershipStatus = (
  status: Stripe.Subscription.Status,
  membership: MembershipStatus
): MembershipStatus => {
  switch (status) {
    case "active":
    case "trialing":
      return membership
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      return "free"
    default:
      return "free"
  }
}

const getSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"]
  })
}

export const updateStripeCustomer = async (
  userId: string,
  subscriptionId: string,
  customerId: string
) => {
  try {
    if (!userId || !subscriptionId || !customerId) {
      throw new Error("Missing required parameters for updateStripeCustomer")
    }

    const subscription = await getSubscription(subscriptionId)

    const result = await updateProfileAction(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id
    })

    if (!result.isSuccess) {
      throw new Error("Failed to update customer profile")
    }

    return result.data
  } catch (error) {
    console.error("Error in updateStripeCustomer:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update Stripe customer")
  }
}

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
): Promise<MembershipStatus> => {
  try {
    if (!subscriptionId || !customerId || !productId) {
      throw new Error(
        "Missing required parameters for manageSubscriptionStatusChange"
      )
    }

    const subscription = await getSubscription(subscriptionId)
    const product = await stripe.products.retrieve(productId)
    const membership = product.metadata.membership as MembershipStatus

    if (!["free", "pro"].includes(membership)) {
      throw new Error(
        `Invalid membership type in product metadata: ${membership}`
      )
    }

    const membershipStatus = getMembershipStatus(
      subscription.status,
      membership
    )

    const updateResult = await updateProfileByStripeCustomerIdAction(
      customerId,
      { stripeSubscriptionId: subscription.id, membership: membershipStatus }
    )

    if (!updateResult.isSuccess) {
      throw new Error("Failed to update subscription status")
    }

    return membershipStatus
  } catch (error) {
    console.error("Error in manageSubscriptionStatusChange:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update subscription status")
  }
}

/**
 * Creates a Stripe customer portal session for the given user
 * @param userId The ID of the user
 * @param returnUrl The URL to redirect to after the customer portal session
 * @returns An ActionState with the URL to redirect to
 */
export async function createCustomerPortalSessionAction(
  userId: string,
  returnUrl: string = "/dashboard"
): Promise<ActionState<{ url: string }>> {
  try {
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "User ID is required" 
      }
    }

    // Get the user's profile to retrieve their Stripe customer ID
    const profileResult = await getProfileByUserIdAction(userId)
    
    if (!profileResult.isSuccess || !profileResult.data) {
      return { 
        isSuccess: false, 
        message: "User profile not found" 
      }
    }

    const { stripeCustomerId } = profileResult.data

    if (!stripeCustomerId) {
      return { 
        isSuccess: false, 
        message: "User does not have a Stripe customer ID" 
      }
    }

    // Create a customer portal session with a timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Stripe API request timed out")), 10000);
    });

    const sessionPromise = stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl
    });

    // Race the Stripe API call against a timeout
    const session = await Promise.race([sessionPromise, timeoutPromise]) as Stripe.BillingPortal.Session;

    return {
      isSuccess: true,
      message: "Customer portal session created successfully",
      data: { url: session.url }
    }
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to create customer portal session" 
    }
  }
}
