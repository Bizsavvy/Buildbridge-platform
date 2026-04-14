import * as React from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-variant text-on-surface-variant py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-outline-variant">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Socials */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-primary font-bold text-title-large">
            BuildBridge
          </Link>
          <p className="text-body-medium max-w-xs">
            Backing the skilled tradespeople building our communities across Nigeria.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-on-surface text-title-medium">Platform</h3>
          <Link href="/browse" className="text-body-medium hover:text-primary transition-colors">Browse Needs</Link>
          <Link href="/impact" className="text-body-medium hover:text-primary transition-colors">Impact Wall</Link>
          <Link href="/how-it-works" className="text-body-medium hover:text-primary transition-colors">How Vouching Works</Link>
          <Link href="/pricing" className="text-body-medium hover:text-primary transition-colors">Fee Breakdown</Link>
        </div>

        {/* Company Column */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-on-surface text-title-medium">Company</h3>
          <Link href="/about" className="text-body-medium hover:text-primary transition-colors">About Us</Link>
          <Link href="/careers" className="text-body-medium hover:text-primary transition-colors">Careers</Link>
          <Link href="/partners" className="text-body-medium hover:text-primary transition-colors">Partner Network</Link>
          <Link href="/contact" className="text-body-medium hover:text-primary transition-colors">Contact</Link>
        </div>

        {/* Legal Column */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-on-surface text-title-medium">Legal</h3>
          <Link href="/terms" className="text-body-medium hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-body-medium hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/ndpr" className="text-body-medium hover:text-primary transition-colors">NDPR Compliance</Link>
          <Link href="/trust" className="text-body-medium hover:text-primary transition-colors">Trust & Escrow Policy</Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-outline flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-body-small">
          &copy; {currentYear} BuildBridge Inc. All rights reserved.
        </p>
        <p className="text-body-small flex items-center gap-1">
          Made for Nigeria
        </p>
      </div>
    </footer>
  );
}
