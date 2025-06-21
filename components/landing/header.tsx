/*
Modern header component with advanced navigation and authentication integration.
*/

"use client"

import MobileDrawer from "@/components/drawer"
import { Icons } from "@/components/icons"
import Menu from "@/components/menu"
import { buttonVariants } from "@/components/ui/button"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Header() {
  const [addBorder, setAddBorder] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setAddBorder(true)
      } else {
        setAddBorder(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header className="bg-background/60 relative sticky top-0 z-50 py-2 backdrop-blur">
      <div className="container flex items-center justify-between">
        <Link
          href="/"
          title="brand-logo"
          className="relative mr-6 flex items-center space-x-2"
        >
          <Icons.logo className="h-[40px] w-auto" />
          <span className="text-xl font-bold">{siteConfig.name}</span>
        </Link>

        <div className="hidden lg:block">
          <div className="flex items-center">
            <nav className="mr-1">
              <Menu />
            </nav>

            <div className="flex items-center gap-2">
              <SignedOut>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "text-background flex w-full gap-2 sm:w-auto"
                  )}
                >
                  <Icons.logo className="size-6" />
                  Get Started For Free
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={cn(navigationMenuTriggerStyle(), "mr-3")}
                >
                  Dashboard
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>

        <div className="mt-2 block cursor-pointer lg:hidden">
          <MobileDrawer />
        </div>
      </div>

      <hr
        className={cn(
          "absolute bottom-0 w-full transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  )
}
