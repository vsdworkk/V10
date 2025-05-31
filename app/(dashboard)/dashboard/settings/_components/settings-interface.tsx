"use server"

import ManageBilling from "./manage-billing"

interface SettingsInterfaceProps {
  userId: string
}

export default async function SettingsInterface({ userId }: SettingsInterfaceProps) {
  // Profile creation is handled globally, so simply render the billing controls.

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow p-6">
        <ManageBilling />
      </div>
    </div>
  )
}
