/*
This client component provides the header for the app.
*/

"use client"

import { Button } from "@/components/ui/button"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Menu, Receipt, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" }
]

const signedInLinks = [{ name: "Dashboard", href: "/dashboard" }]

export default function Header() {
  const [menuState, setMenuState] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  // Prefetch the dashboard route when component mounts
  useEffect(() => {
    router.prefetch('/dashboard')
  }, [router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to handle smooth scrolling
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only process if we're on the home page and it's a hash link
    if (window.location.pathname === '/' && href.startsWith('#')) {
      e.preventDefault()
      const targetId = href.substring(1)
      const element = document.getElementById(targetId)
      
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
        
        // Close mobile menu if open
        if (menuState) {
          setMenuState(false)
        }
      }
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <nav
        data-state={menuState && 'active'}
        className={cn(
          'fixed z-50 w-full transition-all duration-300',
          isScrolled && 'bg-background/75 border-b border-black/5 backdrop-blur-lg'
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-4 lg:gap-0 lg:py-3">
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <motion.div
                className="flex items-center space-x-2 hover:cursor-pointer hover:opacity-80"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  <Receipt className="size-6" />
                  <span className="text-xl font-bold">APSPitchPro</span>
                </Link>
              </motion.div>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="m-auto hidden size-fit lg:block">
                <ul className="flex gap-1">
                  {navLinks.map((item, index) => (
                    <li key={index}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                        >
                          <Link
                            href={item.href}
                            className="text-base"
                            onClick={(e) => handleScrollToSection(e, item.href)}
                          >
                            <span>{item.name}</span>
                          </Link>
                        </Button>
                      </motion.div>
                    </li>
                  ))}
                  
                  <SignedIn>
                    {signedInLinks.map((item, index) => (
                      <li key={index}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={() => router.prefetch(item.href)}
                        >
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                          >
                            <Link
                              href={item.href}
                              className="text-base"
                            >
                              <span>{item.name}</span>
                            </Link>
                          </Button>
                        </motion.div>
                      </li>
                    ))}
                  </SignedIn>
                </ul>
              </div>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  <li>
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      onClick={(e) => {
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                          });
                        }
                        setMenuState(false);
                      }}
                    >
                      <span>Home</span>
                    </Link>
                  </li>
                  {navLinks.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={(e) => {
                          handleScrollToSection(e, item.href);
                          setMenuState(false);
                        }}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                  
                  <SignedIn>
                    {signedInLinks.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                          onClick={() => setMenuState(false)}
                          onMouseEnter={() => router.prefetch(item.href)}
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </SignedIn>
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <SignedOut>
                  <SignInButton>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(isScrolled && 'lg:hidden')}
                      >
                        <span>Sign In</span>
                      </Button>
                    </motion.div>
                  </SignInButton>

                  <SignUpButton>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        className={cn(isScrolled && 'lg:hidden')}
                      >
                        <span>Get Started</span>
                      </Button>
                    </motion.div>
                  </SignUpButton>

                  <SignUpButton>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                      >
                        <span>Get Started</span>
                      </Button>
                    </motion.div>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <div className="flex items-center">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </motion.header>
  )
}