"use client"

import { CreditCard } from "lucide-react"
import { useState } from "react"

/**
 * @function ManageBillingButton
 * A client component that renders a button to redirect to the Stripe customer portal.
 * When clicked, it makes a POST request to the customer portal API endpoint.
 */
export default function ManageBillingButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageBilling = async () => {
    try {
      setIsLoading(true)
      
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
        throw new Error("Failed to create customer portal session")
      }

      const { url } = await response.json()
      
      // Redirect to the Stripe customer portal
      window.location.href = url
    } catch (error) {
      console.error("Error redirecting to customer portal:", error)
      alert("Failed to redirect to billing portal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleManageBilling}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors w-full text-left"
    >
      <CreditCard className="h-4 w-4" />
      {isLoading ? "Loading..." : "Manage Billing"}
    </button>
  )
} 