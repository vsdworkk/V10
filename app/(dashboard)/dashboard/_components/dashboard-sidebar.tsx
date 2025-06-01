/**
 * @description
 * Server component providing a sidebar for the dashboard area.
 * It displays navigation links for pitch management, such as viewing
 * existing pitches or starting a new pitch wizard.
 *
 * Key features:
 * - Simple vertical list of navigation links relevant to pitch building.
 * - Integrates seamlessly into the dashboard layout.
 *
 * @dependencies
 * - This component currently only uses standard Next.js links,
 *   no external dependencies.
 *
 * @notes
 * - It's a server component for now; any future interactive or dynamic
 *   behavior may require converting it to a client component if needed.
 * - The actual routes (/dashboard, /dashboard/new) will be implemented
 *   in later steps (5, 6, etc.).
 * - OPTIMIZATION: Now accepts userId as a prop to avoid redundant auth checks.
 */

"use server"

import Link from "next/link"
import { Settings, CreditCard } from "lucide-react"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import CreatePitchButton from "./create-pitch-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

/**
 * @interface DashboardSidebarProps
 * Defines the props for the DashboardSidebar component.
 */
interface DashboardSidebarProps {
  userId: string
}

/**
 * @function DashboardSidebar
 * @returns JSX element rendering a vertical sidebar with placeholder nav links
 * @notes
 * - We'll rely on Clerk for user info if we need to conditionally display items.
 * - For now, we just show a static list of links for pitch management.
 */
export default async function DashboardSidebar({
  userId
}: DashboardSidebarProps) {
  // Retrieve user profile for credits display
  const profileResult = await getProfileByUserIdAction(userId)
  const credits = profileResult.isSuccess
    ? (profileResult.data?.credits ?? 0)
    : 0

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-gray-800">Pitch Manager</h1>

          {/* Credits Display */}
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Credits</span>
                <Badge
                  variant="secondary"
                  className="ml-auto text-sm font-medium"
                >
                  {credits}
                </Badge>
              </div>
              <div className="mt-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-8 text-xs"
                >
                  <Link href="/#pricing">+ More Credits</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {/* Create New Pitch Button */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full">
              <CreatePitchButton credits={credits} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="pt-4 mt-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Footer content can go here if needed */}
      </SidebarFooter>
    </Sidebar>
  )
}
