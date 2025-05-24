/*
Site footer with quick links and a contact micro form.
*/

"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import ContactMicroForm from "@/components/contact-micro-form"

export default function Footer() {
  return (
    <footer className="bg-[#111827] py-12 text-[rgba(255,255,255,.8)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        <div>
          <Logo className="mb-4" />
          <p className="max-w-sm text-sm">
            Get job-winning APS pitches crafted with AI. Improve your chances
            and save time.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="#pricing"
                className="hover:text-[var(--color-primary)]"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:text-[var(--color-primary)]">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Contact Us</h3>
          <ContactMicroForm />
        </div>
      </div>
    </footer>
  )
}
