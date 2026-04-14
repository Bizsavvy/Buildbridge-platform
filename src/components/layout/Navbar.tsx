"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MobileNav } from "./MobileNav"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? "bg-surface/90 backdrop-blur-md border-b border-outline-variant py-3 shadow-sm" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Left */}
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-title-large">
            <span>BuildBridge</span>
          </Link>

          {/* Links Center (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/browse" className="text-body-large text-on-surface hover:text-primary transition-colors">
              Browse Needs
            </Link>
            <Link href="/how-it-works" className="text-body-large text-on-surface hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/impact" className="text-body-large text-on-surface hover:text-primary transition-colors">
              Impact Wall
            </Link>
          </nav>

          {/* Actions Right (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-body-large text-on-surface font-medium hover:text-primary transition-colors">
              Log In
            </Link>
            <Link href="/login">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Hamburger Navigation */}
          <button 
            className="md:hidden p-2 text-on-surface hover:bg-surface-variant rounded-full"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
