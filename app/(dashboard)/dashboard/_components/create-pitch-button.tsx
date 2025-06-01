"use client"

// Button that checks user credits before routing to the pitch wizard

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Plus } from "lucide-react"
import Link from "next/link"

interface CreatePitchButtonProps {
  credits: number
}

export default function CreatePitchButton({ credits }: CreatePitchButtonProps) {
  const router = useRouter()

  function handleClick() {
    if (credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least one credit to create a pitch.",
        action: (
          <ToastAction altText="Buy credits" asChild>
            <Link href="/#pricing">Purchase Credits</Link>
          </ToastAction>
        )
      })
      return
    }

    router.push("/dashboard/new?new=true")
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full shadow-sm justify-start h-10 px-3 text-sm text-white transition-all hover:brightness-110"
      style={{ backgroundColor: "#444ec1" }}
    >
      <Plus className="h-4 w-4 mr-2" />
      Create New Pitch
    </Button>
  )
}
