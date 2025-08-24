import SettingsInterface from "./_components/settings-interface"
import { auth } from "@clerk/nextjs/server"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsInterface userId={userId} />
    </div>
  )
}
