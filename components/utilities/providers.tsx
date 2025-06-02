/*
This client component provides the providers for the app.
*/

"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps
} from "next-themes"
import { ProfileProvider } from "@/components/utilities/profile-provider"
import type { SelectProfile } from "@/db/schema"

interface ProvidersProps extends ThemeProviderProps {
  initialProfile?: SelectProfile | null
}
export const Providers = ({
  children,
  initialProfile,
  ...props
}: ProvidersProps) => {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        <ProfileProvider initialProfile={initialProfile || null}>
          {children}
        </ProfileProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
