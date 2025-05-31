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
  DrawerTrigger,
} from "@/components/ui/drawer"
import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { IoMenuSharp } from "react-icons/io5"

// Type guard functions
function isDropdownItem(item: any): item is { trigger: string; content: any } {
  return 'trigger' in item && 'content' in item;
}

function isLinkItem(item: any): item is { href: string; label: string } {
  return 'href' in item && 'label' in item;
}

export default function MobileDrawer() {
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
              <Icons.logo className="w-auto h-[40px]" />
              <span className="font-bold text-xl">{siteConfig.name}</span>
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
              <SignedIn>
                <li className="my-3">
                  <Link href="/dashboard" className="font-semibold">
                    Dashboard
                  </Link>
                </li>
              </SignedIn>
            </ul>
          </nav>
        </DrawerHeader>
        <DrawerFooter>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className={buttonVariants({ variant: "outline" })}>
                Sign In
              </button>
            </SignInButton>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full sm:w-auto text-background flex gap-2"
              )}
            >
              <Icons.logo className="h-6 w-6" />
              Get Started For Free
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Signed in</span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </SignedIn>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
} 