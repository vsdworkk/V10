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
import { Settings, Plus, CreditCard } from "lucide-react"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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
  // Get the user's profile to check if they have a Stripe customer ID
  const profileResult = await getProfileByUserIdAction(userId)
  const hasStripeCustomerId =
    profileResult.isSuccess && profileResult.data?.stripeCustomerId
  const credits = profileResult.isSuccess ? (profileResult.data?.credits ?? 0) : 0

  return (
    <div className="w-64 flex-shrink-0 border-r bg-white shadow-sm">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-gray-800">Pitch Manager</h1>
        
        {/* Credits Display */}
        <div className="mt-4">
          <Card className="bg-gray-50">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Credits</span>
                <Badge variant="secondary" className="ml-auto text-xs font-medium">
                  {credits}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <nav className="px-5 py-3 space-y-1">
        {/* Create New Pitch Button */}
        <Link href="/dashboard/new?new=true">
          <Button 
            className="w-full shadow-sm justify-start h-8 px-2 text-xs text-white transition-all hover:brightness-110" 
            style={{backgroundColor: '#444ec1'}}
          >
            <Plus className="h-3 w-3 mr-2" />
            Create New Pitch
          </Button>
        </Link>

        {hasStripeCustomerId && (
          <div className="pt-2 mt-2 border-t">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}
