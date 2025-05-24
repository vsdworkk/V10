"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" }
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-[#FFFFFF]",
        "transition-shadow",
        scrolled && "shadow-[0_1px_6px_rgba(0,0,0,.06)]"
      )}
      style={{ height: "4.5rem" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-12 w-auto" />
        </Link>
        <nav className="hidden gap-4 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button className="h-9 px-4 font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
          Get Started Free
        </Button>
      </div>
    </header>
  )
}
