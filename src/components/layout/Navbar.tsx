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
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top Announcement Bar */}
      <div className="w-full bg-primary text-on-primary py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2">
          <span className="opacity-80">📣</span>
          BuildBridge: The #1 Direct Impact Platform for Nigeria's Artisans
          <Link href="/browse" className="underline hover:opacity-80 transition-opacity ml-1">
            Back a Trade Today →
          </Link>
        </p>
      </div>

      <header
        className={`w-full transition-all duration-300 border-b border-transparent ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-md shadow-sm border-white/20 py-3" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isScrolled ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-primary shadow-xl'}`}>
              <Hammer className="h-5 w-5" />
            </div>
            <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${isScrolled ? 'text-on-surface' : 'text-primary'}`}>
              BuildBridge
            </span>
          </Link>

          {/* Centered Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {[
              { name: "Browse Needs", href: "/browse" },
              { name: "How It Works", href: "/how-it-works" },
              { name: "Impact Wall", href: "/impact" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isScrolled ? 'text-on-surface-variant hover:text-primary' : 'text-on-surface/80 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:flex group cursor-pointer">
              <span className={`text-sm font-bold transition-colors duration-300 ${isScrolled ? 'text-on-surface-variant hover:text-primary' : 'text-on-surface/80 hover:text-white'}`}>
                Log In
              </span>
            </Link>
            
            <Link href="/register" className="cursor-pointer">
              <button 
                className={`h-11 px-7 rounded-full font-extrabold text-sm transition-all flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/10 ${
                  isScrolled ? 'bg-primary text-white' : 'bg-white text-primary'
                }`}
              >
                Get Started
              </button>
            </Link>

            <button 
              className={`md:hidden p-2 transition-colors cursor-pointer ${isScrolled ? 'text-on-surface-variant' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
    </div>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}