"use client"

import { UserButton } from "@clerk/nextjs"

export default function DesktopHeader() {
  return (
    <header className="relative z-20 hidden items-center justify-end p-4 md:flex">
      <div className="flex items-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9"
            }
          }}
        />
      </div>
    </header>
  )
}
