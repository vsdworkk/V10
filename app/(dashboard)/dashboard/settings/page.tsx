"use server"

import { auth } from "@clerk/nextjs/server"
import SettingsInterface from "./_components/settings-interface"

export default async function SettingsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsInterface userId={userId} />
    </div>
  )
} 