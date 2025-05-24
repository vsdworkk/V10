import Link from "next/link"
import { Logo } from "@/components/logo"

export default function Footer() {
  return (
    <footer className="bg-[#111827] py-12 text-[rgba(255,255,255,.8)]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 md:grid-cols-3">
        <div>
          <Logo className="h-8 w-auto text-white" />
          <p className="mt-4 text-sm">
            APSPitchPro helps you craft the perfect pitch for APS roles.
          </p>
        </div>
        <div>
          <h4 className="text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="#features"
                className="hover:text-[var(--color-primary)]"
              >
                Features
              </Link>
            </li>
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
        <div className="space-y-2">
          <h4 className="text-white">Legal</h4>
          <p className="text-sm">© {new Date().getFullYear()} APSPitchPro</p>
        </div>
      </div>
    </footer>
  )
}
