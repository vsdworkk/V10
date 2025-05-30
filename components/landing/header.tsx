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
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
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
    <header
      className={
        "relative sticky top-0 z-50 py-2 bg-background/60 backdrop-blur"
      }
    >
      <div className="flex justify-between items-center container">
        <Link
          href="/"
          title="brand-logo"
          className="relative mr-6 flex items-center space-x-2"
        >
          <Icons.logo className="w-auto h-[40px]" />
          <span className="font-bold text-xl">{siteConfig.name}</span>
        </Link>

        <div className="hidden lg:block">
          <div className="flex items-center ">
            <nav className="mr-1">
              <Menu />
            </nav>

            <div className="gap-2 flex items-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={buttonVariants({ variant: "outline" })}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "w-full sm:w-auto text-background flex gap-2"
                    )}
                  >
                    <Icons.logo className="h-6 w-6" />
                    Get Started For Free
                  </button>
                </SignUpButton>
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
        <div className="mt-2 cursor-pointer block lg:hidden">
          <MobileDrawer />
        </div>
      </div>
      <hr
        className={cn(
          "absolute w-full bottom-0 transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  )
}