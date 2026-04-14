import * as React from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background text-on-surface-variant py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-[var(--color-outline-variant)]">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-primary font-bold text-xl">
            BuildBridge
          </Link>
          <p className="text-sm max-w-xs">
            Backing the skilled tradespeople building our communities across Nigeria.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-on-surface text-base">Platform</h3>
          <Link href="/browse" className="text-sm hover:text-primary transition-colors cursor-pointer">Browse Needs</Link>
          <Link href="/impact" className="text-sm hover:text-primary transition-colors cursor-pointer">Impact Wall</Link>
          <Link href="/how-it-works" className="text-sm hover:text-primary transition-colors cursor-pointer">How Vouching Works</Link>
          <Link href="/pricing" className="text-sm hover:text-primary transition-colors cursor-pointer">Fee Breakdown</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-on-surface text-base">Company</h3>
          <Link href="/about" className="text-sm hover:text-primary transition-colors cursor-pointer">About Us</Link>
          <Link href="/careers" className="text-sm hover:text-primary transition-colors cursor-pointer">Careers</Link>
          <Link href="/partners" className="text-sm hover:text-primary transition-colors cursor-pointer">Partner Network</Link>
          <Link href="/contact" className="text-sm hover:text-primary transition-colors cursor-pointer">Contact</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-on-surface text-base">Legal</h3>
          <Link href="/terms" className="text-sm hover:text-primary transition-colors cursor-pointer">Terms of Service</Link>
          <Link href="/privacy" className="text-sm hover:text-primary transition-colors cursor-pointer">Privacy Policy</Link>
          <Link href="/ndpr" className="text-sm hover:text-primary transition-colors cursor-pointer">NDPR Compliance</Link>
          <Link href="/trust" className="text-sm hover:text-primary transition-colors cursor-pointer">Trust & Escrow Policy</Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-[var(--color-outline-variant)] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">
          &copy; {currentYear} BuildBridge Inc. All rights reserved.
        </p>
        <p className="text-sm flex items-center gap-1">
          Made for Nigeria
        </p>
      </div>
    </footer>
  );
}