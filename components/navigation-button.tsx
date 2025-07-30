import React from "react"
import { Button } from "./ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NavigationButton({
  className,
  text = "Back"
}: {
  className?: string
  text?: string
}) {
  return (
    <Button
      variant="ghost"
      className={cn("pl-0 transition-all hover:pl-3", className)}
    >
      <ChevronLeft />
      {text}
    </Button>
  )
}
