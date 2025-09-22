/**
 * @file app/dashboard/_components/dashboard-sidebar.tsx
 * @description
 * Server component providing a sidebar for the dashboard area.
 * Displays credits, create pitch CTA, settings, and (if admin) the Job Picks admin link.
 *
 * Changes:
 * - Added admin-only "Job Picks" link using isAdmin() from lib/authz
 * - Added "use server" directive at top per project conventions
 */

"use server"

import Link from "next/link"
import { Settings, CreditCard, Newspaper } from "lucide-react"
import { ensureProfileAction } from "@/actions/db/profiles-actions"
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
import { isAdmin } from "@/lib/authz"

interface DashboardSidebarProps {
  userId: string
}

export default async function DashboardSidebar({
  userId
}: DashboardSidebarProps) {
  // Credits
  const profileResult = await ensureProfileAction(userId)
  const credits =
    profileResult.isSuccess && profileResult.data
      ? profileResult.data.credits
      : 0

  // Admin check for conditional links
  const admin = await isAdmin()

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-gray-800">Pitch Manager</h1>

          {/* Credits Display */}
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CreditCard className="text-muted-foreground size-4" />
                <span className="text-muted-foreground text-sm">Credits</span>
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
                  className="h-8 w-full text-xs"
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

        <div className="mt-4 border-t pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        {admin && (
          <div className="mt-4 border-t pt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/dashboard/job-picks"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Newspaper className="size-4" />
                    Job Picks (Admin)
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Reserved for future items */}
      </SidebarFooter>
    </Sidebar>
  )
}
