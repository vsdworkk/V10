/*
Mobile navigation drawer component with authentication integration.
*/

"use client"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from "@/components/ui/drawer"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { useEffect, useState } from "react"
import { IoMenuSharp } from "react-icons/io5"

// Type guard functions
function isDropdownItem(item: any): item is { trigger: string; content: any } {
  return "trigger" in item && "content" in item
}

function isLinkItem(item: any): item is { href: string; label: string } {
  return "href" in item && "label" in item
}

export default function MobileDrawer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Drawer>
      <DrawerTrigger>
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <div className="">
            <Link
              href="/"
              title="brand-logo"
              className="relative mr-6 flex items-center space-x-2"
            >
              <Icons.logo className="h-[40px] w-auto" />
              <span className="text-xl font-bold">{siteConfig.name}</span>
            </Link>
          </div>
          <nav>
            <ul className="mt-7 text-left">
              {siteConfig.header.map((item, index) => (
                <li key={index} className="my-3">
                  {isDropdownItem(item) ? (
                    <span className="font-semibold">{item.trigger}</span>
                  ) : isLinkItem(item) ? (
                    <Link href={item.href} className="font-semibold">
                      {item.label}
                    </Link>
                  ) : null}
                </li>
              ))}
              {mounted && (
                <SignedIn>
                  <li className="my-3">
                    <Link href="/dashboard" className="font-semibold">
                      Dashboard
                    </Link>
                  </li>
                </SignedIn>
              )}
            </ul>
          </nav>
        </DrawerHeader>
        <DrawerFooter>
          {mounted && (
            <>
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
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Signed in
                  </span>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
