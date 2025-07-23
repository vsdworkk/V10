/*
This client component provides the providers for the app.
*/

"use client"

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps
} from "next-themes"

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
