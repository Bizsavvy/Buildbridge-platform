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
        className={`fixed z-50 left-0 right-0 transition-all duration-500 px-4 sm:px-6 flex justify-center ${
          isScrolled ? "top-4" : "top-6"
        }`}
      >
        <div className="w-full max-w-5xl p-2 flex items-center justify-between rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] saturate-[1.8]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 pl-4 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
              <Hammer className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white leading-none">
              BuildBridge
            </span>
          </Link>

          {/* Centered Desktop Nav */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 pl-8">
            {[
              { name: "Browse Needs", href: "/browse" },
              { name: "How It Works", href: "/how-it-works" },
              { name: "Impact Wall", href: "/impact" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden md:flex items-center justify-center h-10 px-5 cursor-pointer">
              <span className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                Log In
              </span>
            </Link>
            
            <Link href="/onboarding" className="cursor-pointer">
              <button 
                className="h-10 px-6 rounded-[1.25rem] font-bold transition-all flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  background: 'var(--color-primary)', 
                  color: 'var(--color-on-primary)',
                  boxShadow: '0 4px 14px 0 rgba(var(--color-primary-rgb), 0.3)' 
                }}
              >
                Get Started
              </button>
            </Link>

            <button 
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors cursor-pointer ml-1 mr-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}