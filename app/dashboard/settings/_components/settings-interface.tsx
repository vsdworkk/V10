import ManageBilling from "./manage-billing"

interface SettingsInterfaceProps {
  userId: string
}

export default async function SettingsInterface({
  userId
}: SettingsInterfaceProps) {
  // Profile creation is handled globally, so simply render the billing controls.

  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <ManageBilling />
      </div>
    </div>
  )
}
