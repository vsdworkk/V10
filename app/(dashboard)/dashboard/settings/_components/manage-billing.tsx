"use client"

import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export default function ManageBilling() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageBilling = async () => {
    try {
      // Set loading state immediately to provide instant feedback
      setIsLoading(true)
      
      // Show a loading toast to inform the user
      toast({
        title: "Preparing billing portal...",
        description: "You'll be redirected to Stripe in a moment.",
        duration: 5000
      })
      
      // Make a POST request to the customer portal API endpoint
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create customer portal session")
      }

      const { url } = await response.json()
      
      // Redirect to the Stripe customer portal
      window.location.href = url
    } catch (error) {
      console.error("Error redirecting to customer portal:", error)
      
      // Show error toast instead of alert for better UX
      toast({
        title: "Error",
        description: "Failed to redirect to billing portal. Please try again.",
        variant: "destructive",
        duration: 5000
      })
      
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Manage Billing</h2>
      <p className="text-gray-500 mb-4">Update payment information by accessing your Stripe customer portal.</p>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleManageBilling}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">CONNECTING TO STRIPE...</span>
              <span className="animate-spin">⟳</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              MANAGE BILLING
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 