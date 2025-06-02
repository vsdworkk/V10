"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { SelectProfile } from "@/db/schema"

interface ProfileContextValue {
  profile: SelectProfile | null
  setProfile: (profile: SelectProfile | null) => void
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({
  initialProfile,
  children
}: {
  initialProfile: SelectProfile | null
  children: ReactNode
}) {
  const [profile, setProfile] = useState<SelectProfile | null>(initialProfile)
  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return ctx
}
