"use server"

import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import ManageBilling from "./manage-billing"

interface SettingsInterfaceProps {
  userId: string
}

export default async function SettingsInterface({
  userId
}: SettingsInterfaceProps) {
  // Get the user's profile to check if they have a Stripe customer ID
  const profileResult = await getProfileByUserIdAction(userId)
  const hasStripeCustomerId =
    profileResult.isSuccess && profileResult.data?.stripeCustomerId

  return (
    <div className="max-w-3xl space-y-8">
      {hasStripeCustomerId && (
        <div className="rounded-lg bg-white p-6 shadow">
          <ManageBilling />
        </div>
      )}
    </div>
  )
}
