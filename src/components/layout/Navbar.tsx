"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Hammer } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MobileNav } from "./MobileNav"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-4 z-50 w-[calc(100%-2rem)] mx-auto left-0 right-0 transition-all duration-500 rounded-2xl ${
          isScrolled 
            ? "glass-card py-3" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25 transition-all group-hover:scale-105 group-hover:rotate-3">
              <Hammer className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              BuildBridge
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { name: "Browse Needs", href: "/browse" },
              { name: "How It Works", href: "/how-it-works" },
              { name: "Impact Wall", href: "/impact" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-slate-600 hover:text-primary transition-colors relative group py-2 cursor-pointer"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="cursor-pointer">
              <Button variant="ghost" className="font-semibold text-slate-700 hover:text-primary">
                Log In
              </Button>
            </Link>
            <Link href="/onboarding" className="cursor-pointer">
              <Button variant="primary" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}